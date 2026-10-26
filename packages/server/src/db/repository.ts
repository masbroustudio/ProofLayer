import type { Client } from '@libsql/client';
import type { 
  PolicyAST, 
  ExecutionRequest, 
  EvaluationResult, 
  ApprovalPayload, 
  EvidenceNode, 
  SignedApprovalToken 
} from '@prooflayer/core';

export class ProofLayerRepository {
  constructor(private client: Client) {}

  public async getPolicies(): Promise<PolicyAST[]> {
    const result = await this.client.execute("SELECT compiled_ast FROM policies WHERE status = 'active';");
    return result.rows.map((row) => JSON.parse(row.compiled_ast as string));
  }

  public async getPolicyById(id: string): Promise<PolicyAST | null> {
    const result = await this.client.execute({
      sql: 'SELECT compiled_ast FROM policies WHERE id = ?;',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return JSON.parse(result.rows[0].compiled_ast as string);
  }

  public async upsertPolicy(policy: PolicyAST): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT INTO policies (id, name, version, action_pattern, compiled_ast, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          version = excluded.version + 1,
          action_pattern = excluded.action_pattern,
          compiled_ast = excluded.compiled_ast;
      `,
      args: [
        policy.id,
        policy.name,
        policy.version,
        policy.actionPattern,
        JSON.stringify(policy),
        Date.now(),
      ],
    });
  }

  public async insertExecutionRequest(req: ExecutionRequest, payloadHash: string, status: string): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT INTO execution_requests (id, agent_id, action, payload, payload_hash, provenance_chain, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        req.id,
        req.agentId,
        req.action,
        JSON.stringify(req.payload),
        payloadHash,
        JSON.stringify(req.provenanceChain),
        status,
        req.createdAt || Date.now(),
      ],
    });
  }

  public async updateRequestStatus(id: string, status: string): Promise<void> {
    await this.client.execute({
      sql: 'UPDATE execution_requests SET status = ? WHERE id = ?;',
      args: [status, id],
    });
  }

  public async getRequestById(id: string): Promise<any | null> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM execution_requests WHERE id = ?;',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      agentId: row.agent_id,
      action: row.action,
      payload: JSON.parse(row.payload as string),
      payloadHash: row.payload_hash,
      provenanceChain: JSON.parse(row.provenance_chain as string),
      status: row.status,
      createdAt: row.created_at,
    };
  }

  public async insertPolicyEvaluation(requestId: string, evalResult: EvaluationResult): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT INTO policy_evaluations (id, request_id, policy_id, decision, reason, failed_invariants, evaluation_latency_ms, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        `eval-${requestId}`,
        requestId,
        evalResult.policyId,
        evalResult.decision,
        evalResult.reason,
        JSON.stringify(evalResult.failedInvariants),
        evalResult.latencyMs,
        Date.now(),
      ],
    });
  }

  public async insertApproval(signedToken: SignedApprovalToken): Promise<void> {
    const { approval, signature } = signedToken;
    await this.client.execute({
      sql: `
        INSERT INTO approvals (id, request_id, payload_hash, reviewer_id, decision, nonce, signature, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        `appr-${approval.requestId}`,
        approval.requestId,
        approval.payloadHash,
        approval.reviewerId,
        approval.decision,
        approval.nonce,
        signature,
        Date.now(),
      ],
    });
  }

  public async insertEvidenceNodes(nodes: EvidenceNode[]): Promise<void> {
    for (const node of nodes) {
      await this.client.execute({
        sql: `
          INSERT OR REPLACE INTO evidence_nodes (id, request_id, type, label, data, parent_ids, node_hash, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: [
          node.id,
          node.requestId,
          node.type,
          node.label,
          JSON.stringify(node.data),
          JSON.stringify(node.parentIds),
          node.nodeHash,
          node.timestamp,
        ],
      });
    }
  }

  public async getEvidenceNodesByRequestId(requestId: string): Promise<EvidenceNode[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM evidence_nodes WHERE request_id = ? ORDER BY timestamp ASC;',
      args: [requestId],
    });

    return result.rows.map((row) => ({
      id: row.id as string,
      requestId: row.request_id as string,
      type: row.type as any,
      label: row.label as string,
      data: JSON.parse(row.data as string),
      parentIds: JSON.parse(row.parent_ids as string),
      nodeHash: row.node_hash as string,
      timestamp: Number(row.timestamp),
    }));
  }

  public async insertToolExecution(requestId: string, toolName: string, outputResult: any): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT INTO tool_executions (id, request_id, tool_name, output_result, created_at)
        VALUES (?, ?, ?, ?, ?);
      `,
      args: [
        `exec-${requestId}`,
        requestId,
        toolName,
        JSON.stringify(outputResult),
        Date.now(),
      ],
    });
  }

  public async getRecentRequests(limit: number = 20): Promise<any[]> {
    const result = await this.client.execute({
      sql: 'SELECT * FROM execution_requests ORDER BY created_at DESC LIMIT ?;',
      args: [limit],
    });

    return result.rows.map((row) => ({
      id: row.id,
      agentId: row.agent_id,
      action: row.action,
      payload: JSON.parse(row.payload as string),
      payloadHash: row.payload_hash,
      provenanceChain: JSON.parse(row.provenance_chain as string),
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}
