import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../src/server.js';
import { hashPayload, signApproval, generateNonce, type ApprovalPayload } from '@prooflayer/core';
import type { FastifyInstance } from 'fastify';

describe('Slice 1 Integration: Fastify Server with @libsql/client SQLite & SSE Telemetry', () => {
  let app: FastifyInstance;
  const secretKey = 'test-server-integration-secret';

  beforeAll(async () => {
    // Run against in-memory SQLite database for 100% test isolation
    const serverObj = await createServer({
      dbUrl: 'file::memory:?cache=shared',
      secretKey,
    });
    app = serverObj.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');
  });

  it('GET /api/policies returns default seeded policies', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/policies',
    });
    expect(res.statusCode).toBe(200);
    const policies = res.json();
    expect(policies).toHaveLength(2);
    expect(policies.some((p: any) => p.id === 'policy-fin-001')).toBe(true);
    expect(policies.some((p: any) => p.id === 'policy-cloud-001')).toBe(true);
  });

  it('POST /api/interceptor/propose allows routine payment (<$500)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/interceptor/propose',
      payload: {
        request: {
          id: 'test-routine-50',
          agentId: 'agent-fin-executor',
          provenanceChain: [{ agentId: 'agent-fin-executor', tier: 'executor' }],
          action: 'payment.execute',
          payload: { amount: 50, currency: 'USD', recipient: 'Office Supplies Inc' },
          createdAt: Date.now(),
        },
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('executed');
    expect(body.output.status).toBe('cleared');
    expect(body.output.amount).toBe(50);
  });

  it('POST /api/sandbox/simulate triggers SWARM_ATTACK and hard-blocks Confused Deputy', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/sandbox/simulate',
      payload: {
        scenario: 'SWARM_ATTACK',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.result.status).toBe('blocked');
    expect(body.result.error).toBe('PRIVILEGE_ESCALATION_DETECTED');
    expect(body.result.reason).toContain('agent-web-scraper holds tier untrusted_reader');
  });

  it('POST /api/sandbox/simulate triggers TOCTOU_TAMPER and aborts execution', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/sandbox/simulate',
      payload: {
        scenario: 'TOCTOU_TAMPER',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.result.status).toBe('blocked');
    expect(body.result.error).toBe('PAYLOAD_HASH_MISMATCH');
  });

  it('High-Value Payment flow: holds for approval, signs HMAC, executes safely', async () => {
    const highValPayload = { amount: 1200, currency: 'USD', recipient: 'Legitimate Contractor' };
    const requestId = 'req-fin-1200-flow';

    // 1. Propose $1,200 -> Expect PENDING_APPROVAL
    const proposeRes = await app.inject({
      method: 'POST',
      url: '/api/interceptor/propose',
      payload: {
        request: {
          id: requestId,
          agentId: 'agent-fin-executor',
          provenanceChain: [{ agentId: 'agent-fin-executor', tier: 'executor' }],
          action: 'payment.execute',
          payload: highValPayload,
          createdAt: Date.now(),
        },
      },
    });

    expect(proposeRes.statusCode).toBe(200);
    const proposeBody = proposeRes.json();
    expect(proposeBody.status).toBe('pending_approval');
    expect(proposeBody.payloadHash).toBe(hashPayload(highValPayload));

    // 2. Submit human approval signed token
    const approval: ApprovalPayload = {
      requestId,
      payloadHash: proposeBody.payloadHash,
      reviewerId: 'alice@security.internal',
      decision: 'approved',
      nonce: generateNonce(),
      expiresAt: Date.now() + 60_000,
    };
    const signedToken = signApproval(approval, secretKey);

    const approveRes = await app.inject({
      method: 'POST',
      url: '/api/approvals/submit',
      payload: { signedToken },
    });

    expect(approveRes.statusCode).toBe(200);
    const approveBody = approveRes.json();
    expect(approveBody.status).toBe('executed');
    expect(approveBody.output.amount).toBe(1200);

    // 3. Query Evidence DAG
    const dagRes = await app.inject({
      method: 'GET',
      url: `/api/evidence/${requestId}`,
    });
    expect(dagRes.statusCode).toBe(200);
    const dag = dagRes.json();
    expect(dag.nodes.length).toBeGreaterThanOrEqual(4); // INTENT, POLICY_CHECK, APPROVAL, EXECUTION

    // 4. Query Trust Receipt
    const receiptRes = await app.inject({
      method: 'GET',
      url: `/api/evidence/${requestId}/receipt`,
    });
    expect(receiptRes.statusCode).toBe(200);
    const receipt = receiptRes.json();
    expect(receipt.verdict).toBe('VERIFIED_EXECUTION');
    expect(receipt.complianceMetadata.standard).toBe('EU_AI_ACT_ART_14');
  });
});
