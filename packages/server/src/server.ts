import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { 
  ProofLayerInterceptor, 
  buildEvidenceDag, 
  generateTrustReceipt, 
  hashPayload, 
  signApproval, 
  generateNonce,
  type ExecutionRequest,
  type SignedApprovalToken,
  type ApprovalPayload
} from '@prooflayer/core';
import { initDb, runMigrations } from './db/client.js';
import { ProofLayerRepository } from './db/repository.js';
import { EventBroadcaster } from './events.js';

export interface ServerOptions {
  dbUrl?: string;
  secretKey?: string;
  port?: number;
}

export async function createServer(options: ServerOptions = {}): Promise<{
  app: FastifyInstance;
  repo: ProofLayerRepository;
  interceptor: ProofLayerInterceptor;
  broadcaster: EventBroadcaster;
}> {
  const dbUrl = options.dbUrl || 'file:prooflayer.sqlite';
  const secretKey = options.secretKey || 'prooflayer-enterprise-secret-2026';

  const client = initDb(dbUrl);
  await runMigrations(client);
  const repo = new ProofLayerRepository(client);
  const broadcaster = new EventBroadcaster();

  const policies = await repo.getPolicies();
  const interceptor = new ProofLayerInterceptor({
    secretKey,
    policies,
  });

  const app = fastify({ logger: false });

  await app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Protected Mock Tools Harness
  const mockTools: Record<string, (payload: any) => Promise<any>> = {
    'payment.execute': async (payload) => {
      return {
        txId: `tx-${Date.now().toString(36)}`,
        status: 'cleared',
        amount: payload.amount,
        currency: payload.currency || 'USD',
        recipient: payload.recipient,
        processedAt: new Date().toISOString(),
      };
    },
    'cloud.deploy': async (payload) => {
      return {
        deploymentId: `dep-${Date.now().toString(36)}`,
        status: 'deployed',
        environment: payload.environment,
        service: payload.service,
      };
    },
  };

  // 1. Health & Policies
  app.get('/api/health', async () => ({ status: 'ok', timestamp: Date.now() }));
  app.get('/api/policies', async () => await repo.getPolicies());
  app.get('/api/requests', async () => await repo.getRecentRequests(30));

  // 2. Real-Time Telemetry SSE Stream
  app.get('/api/events', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    broadcaster.addClient(reply);
  });

  // 3. Core Tool Interceptor (Agent / MCP Proxy)
  app.post<{ Body: { request: ExecutionRequest; signedToken?: SignedApprovalToken } }>(
    '/api/interceptor/propose',
    async (req, reply) => {
      const { request, signedToken } = req.body;
      const payloadHash = hashPayload(request.payload);

      const targetTool = mockTools[request.action] || (async (p: any) => ({ result: 'executed_generic', ...p }));

      // Execute via ProofLayerInterceptor
      const result = await interceptor.handleToolCall(request, targetTool, signedToken);

      // Persist state in SQLite
      await repo.insertExecutionRequest(request, payloadHash, result.status);
      await repo.insertEvidenceNodes(result.evidenceDag.nodes);

      if (result.status === 'executed') {
        await repo.insertToolExecution(request.id, request.action, result.output);
        if (signedToken) {
          await repo.insertApproval(signedToken);
        }
      }

      // Broadcast telemetry to Studio UI
      broadcaster.broadcast({
        id: request.id,
        type: result.status === 'executed' ? 'EXECUTED' : result.status === 'pending_approval' ? 'APPROVAL_REQUIRED' : 'BLOCKED',
        timestamp: Date.now(),
        data: {
          requestId: request.id,
          action: request.action,
          agentId: request.agentId,
          payload: request.payload,
          payloadHash,
          provenanceChain: request.provenanceChain,
          status: result.status,
          error: result.error,
          reason: result.reason,
        },
      });

      return reply.send(result);
    }
  );

  // 4. Human Approval Submission (Anti-TOCTOU Gate)
  app.post<{ Body: { signedToken?: SignedApprovalToken; requestId?: string; reviewerId?: string; decision?: 'approved' | 'rejected' } }>(
    '/api/approvals/submit',
    async (req, reply) => {
      let signedToken = req.body.signedToken;

      const targetRequestId = signedToken ? signedToken.approval.requestId : req.body.requestId;
      if (!targetRequestId) {
        return reply.status(400).send({ error: 'MISSING_REQUEST_ID' });
      }

      const requestRecord = await repo.getRequestById(targetRequestId);
      if (!requestRecord) {
        return reply.status(404).send({ error: 'REQUEST_NOT_FOUND' });
      }

      // If called from Studio UI, generate the cryptographically bound HMAC token on server
      if (!signedToken) {
        const approvalPayload: ApprovalPayload = {
          requestId: targetRequestId,
          payloadHash: requestRecord.payloadHash,
          reviewerId: req.body.reviewerId || 'dual-auth-signers',
          decision: req.body.decision || 'approved',
          nonce: generateNonce(),
          expiresAt: Date.now() + 120_000,
        };
        signedToken = signApproval(approvalPayload, secretKey);
      }

      const request: ExecutionRequest = {
        id: requestRecord.id,
        agentId: requestRecord.agentId,
        provenanceChain: requestRecord.provenanceChain,
        action: requestRecord.action,
        payload: requestRecord.payload,
        createdAt: requestRecord.createdAt,
      };

      const targetTool = mockTools[request.action] || (async (p: any) => ({ result: 'executed_generic', ...p }));
      const result = await interceptor.handleToolCall(request, targetTool, signedToken);

      await repo.updateRequestStatus(request.id, result.status);
      await repo.insertEvidenceNodes(result.evidenceDag.nodes);

      if (result.status === 'executed') {
        await repo.insertApproval(signedToken);
        await repo.insertToolExecution(request.id, request.action, result.output);
      }

      broadcaster.broadcast({
        id: request.id,
        type: result.status === 'executed' ? 'EXECUTED' : 'BLOCKED',
        timestamp: Date.now(),
        data: {
          requestId: request.id,
          action: request.action,
          status: result.status,
          error: result.error,
          reason: result.reason,
        },
      });

      return reply.send(result);
    }
  );

  // 5. Evidence DAG & Trust Receipt Queries
  app.get<{ Params: { requestId: string } }>('/api/evidence/:requestId', async (req, reply) => {
    const nodes = await repo.getEvidenceNodesByRequestId(req.params.requestId);
    if (nodes.length === 0) {
      return reply.status(404).send({ error: 'NO_EVIDENCE_FOUND' });
    }
    const dag = buildEvidenceDag(req.params.requestId, nodes);
    return reply.send(dag);
  });

  app.get<{ Params: { requestId: string } }>('/api/evidence/:requestId/receipt', async (req, reply) => {
    const nodes = await repo.getEvidenceNodesByRequestId(req.params.requestId);
    const request = await repo.getRequestById(req.params.requestId);
    if (!request || nodes.length === 0) {
      return reply.status(404).send({ error: 'RECEIPT_NOT_FOUND' });
    }

    const receipt = generateTrustReceipt({
      requestId: request.id,
      action: request.action,
      policyId: 'policy-fin-001',
      verdict: request.status === 'executed' ? 'VERIFIED_EXECUTION' : 'PREVENTED_VIOLATION',
      payloadHash: request.payloadHash,
      nodes,
    });

    return reply.send(receipt);
  });

  // 6. Red-Team Sandbox Attack Simulator
  app.post<{ Body: { scenario: 'SWARM_ATTACK' | 'TOCTOU_TAMPER' | 'CLEAN_PAYMENT' } }>(
    '/api/sandbox/simulate',
    async (req, reply) => {
      const { scenario } = req.body;
      const targetTool = mockTools['payment.execute'];

      if (scenario === 'SWARM_ATTACK') {
        // Attack: Scraper hijacked by indirect prompt injection in invoice
        const attackReq: ExecutionRequest = {
          id: `sim-swarm-${Date.now()}`,
          agentId: 'agent-fin-executor',
          provenanceChain: [
            { agentId: 'agent-web-scraper', tier: 'untrusted_reader' },
            { agentId: 'agent-coordinator', tier: 'worker', delegatedBy: 'agent-web-scraper' },
            { agentId: 'agent-fin-executor', tier: 'executor', delegatedBy: 'agent-coordinator' },
          ],
          action: 'payment.execute',
          payload: { amount: 1200, currency: 'USD', recipient: 'Attacker Rogue Acct #8819' },
          createdAt: Date.now(),
        };

        const result = await interceptor.handleToolCall(attackReq, targetTool);
        await repo.insertExecutionRequest(attackReq, hashPayload(attackReq.payload), result.status);
        await repo.insertEvidenceNodes(result.evidenceDag.nodes);

        broadcaster.broadcast({
          id: attackReq.id,
          type: 'BLOCKED',
          timestamp: Date.now(),
          data: {
            requestId: attackReq.id,
            action: attackReq.action,
            agentId: attackReq.agentId,
            payload: attackReq.payload,
            status: result.status,
            error: result.error,
            reason: result.reason,
          },
        });

        return reply.send({ scenario, result, request: attackReq });
      }

      if (scenario === 'TOCTOU_TAMPER') {
        // Legitimate proposal for $500
        const legitimateReq: ExecutionRequest = {
          id: `sim-toctou-${Date.now()}`,
          agentId: 'agent-fin-executor',
          provenanceChain: [{ agentId: 'agent-fin-executor', tier: 'executor' }],
          action: 'payment.execute',
          payload: { amount: 500, currency: 'USD', recipient: 'Legitimate Contractor' },
          createdAt: Date.now(),
        };

        const legitimateHash = hashPayload(legitimateReq.payload);

        // Sign for $500
        const approval: ApprovalPayload = {
          requestId: legitimateReq.id,
          payloadHash: legitimateHash,
          reviewerId: 'lead-finance-officer',
          decision: 'approved',
          nonce: generateNonce(),
          expiresAt: Date.now() + 60_000,
        };
        const signedToken = signApproval(approval, secretKey);

        // Attacker or drifting agent attempts to execute mutated $5,000 payload with the $500 signature
        const tamperedReq: ExecutionRequest = {
          ...legitimateReq,
          payload: { amount: 5000, currency: 'USD', recipient: 'Legitimate Contractor' },
        };

        const result = await interceptor.handleToolCall(tamperedReq, targetTool, signedToken);
        await repo.insertExecutionRequest(tamperedReq, hashPayload(tamperedReq.payload), result.status);
        await repo.insertEvidenceNodes(result.evidenceDag.nodes);

        broadcaster.broadcast({
          id: tamperedReq.id,
          type: 'BLOCKED',
          timestamp: Date.now(),
          data: {
            requestId: tamperedReq.id,
            action: tamperedReq.action,
            agentId: tamperedReq.agentId,
            payload: tamperedReq.payload,
            status: result.status,
            error: result.error,
            reason: result.reason,
          },
        });

        return reply.send({ scenario, result, request: tamperedReq });
      }

      // Default: CLEAN_PAYMENT routine $50
      const cleanReq: ExecutionRequest = {
        id: `sim-clean-${Date.now()}`,
        agentId: 'agent-fin-executor',
        provenanceChain: [{ agentId: 'agent-fin-executor', tier: 'executor' }],
        action: 'payment.execute',
        payload: { amount: 50, currency: 'USD', recipient: 'Office Supplies Inc' },
        createdAt: Date.now(),
      };

      const result = await interceptor.handleToolCall(cleanReq, targetTool);
      await repo.insertExecutionRequest(cleanReq, hashPayload(cleanReq.payload), result.status);
      await repo.insertEvidenceNodes(result.evidenceDag.nodes);
      await repo.insertToolExecution(cleanReq.id, cleanReq.action, result.output);

      broadcaster.broadcast({
        id: cleanReq.id,
        type: 'EXECUTED',
        timestamp: Date.now(),
        data: {
          requestId: cleanReq.id,
          action: cleanReq.action,
          agentId: cleanReq.agentId,
          payload: cleanReq.payload,
          status: result.status,
          output: result.output,
        },
      });

      return reply.send({ scenario, result, request: cleanReq });
    }
  );

  return { app, repo, interceptor, broadcaster };
}

// Standalone execution entry point
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  const port = Number(process.env.PORT) || 3001;
  const { app } = await createServer();
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`[ProofLayer Server] Running on http://localhost:${port}`);
}
