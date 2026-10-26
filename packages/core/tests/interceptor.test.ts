import { describe, it, expect } from 'vitest';
import { ProofLayerInterceptor } from '../src/interceptor.js';
import { signApproval, generateNonce, hashPayload } from '../src/crypto.js';
import type { PolicyAST, ExecutionRequest, ApprovalPayload } from '../src/types.js';

describe('TDD: ProofLayer Runtime Interceptor & Tool Boundary', () => {
  const secretKey = 'test-interceptor-secret';

  const paymentPolicy: PolicyAST = {
    id: 'policy-fin-001',
    name: 'High-Value Payment Guard',
    version: 1,
    actionPattern: 'payment.*',
    requiredPrivilegeTier: 'executor',
    invariants: [
      {
        id: 'inv-threshold-500',
        field: 'amount',
        operator: 'lte',
        value: 500,
        failureAction: 'require_approval',
        failureMessage: 'Transactions exceeding $500 require human authorization',
      },
    ],
  };

  it('allows direct execution of routine operations (<$500 by executor agent)', async () => {
    const interceptor = new ProofLayerInterceptor({ secretKey, policies: [paymentPolicy] });

    let toolExecuted = false;
    const mockPaymentTool = async (payload: { amount: number; recipient: string }) => {
      toolExecuted = true;
      return { status: 'success', txId: 'tx-001', amount: payload.amount };
    };

    const request: ExecutionRequest = {
      id: 'req-routine-1',
      agentId: 'agent-fin-exec',
      provenanceChain: [{ agentId: 'agent-fin-exec', tier: 'executor' }],
      action: 'payment.execute',
      payload: { amount: 50, recipient: 'Acme Supplies' },
      createdAt: Date.now(),
    };

    const result = await interceptor.handleToolCall(request, mockPaymentTool);

    expect(toolExecuted).toBe(true);
    expect(result.status).toBe('executed');
    expect(result.output).toEqual({ status: 'success', txId: 'tx-001', amount: 50 });
    expect(result.evidenceDag.nodes).toHaveLength(3); // INTENT -> POLICY_CHECK -> EXECUTION
  });

  it('SWARM ESCALATION: Blocks tool when unprivileged scraper is in the provenance chain', async () => {
    const interceptor = new ProofLayerInterceptor({ secretKey, policies: [paymentPolicy] });

    let toolExecuted = false;
    const mockPaymentTool = async () => {
      toolExecuted = true;
      return { status: 'success' };
    };

    const request: ExecutionRequest = {
      id: 'req-swarm-attack',
      agentId: 'subagent-fin-exec',
      provenanceChain: [
        { agentId: 'subagent-scraper', tier: 'untrusted_reader' },
        { agentId: 'subagent-fin-exec', tier: 'executor', delegatedBy: 'subagent-scraper' },
      ],
      action: 'payment.execute',
      payload: { amount: 1200, recipient: 'Attacker Acct' },
      createdAt: Date.now(),
    };

    const result = await interceptor.handleToolCall(request, mockPaymentTool);

    expect(toolExecuted).toBe(false); // Tool is never called!
    expect(result.status).toBe('blocked');
    expect(result.error).toBe('PRIVILEGE_ESCALATION_DETECTED');
  });

  it('HOLDS FOR APPROVAL: Halts $1,200 payment and permits execution ONLY when signed token matches', async () => {
    const interceptor = new ProofLayerInterceptor({ secretKey, policies: [paymentPolicy] });

    let toolExecuted = false;
    const mockPaymentTool = async (payload: any) => {
      toolExecuted = true;
      return { status: 'success', txId: 'tx-1200-authorized' };
    };

    const payload = { amount: 1200, recipient: 'Contractor Corp' };
    const request: ExecutionRequest = {
      id: 'req-high-val',
      agentId: 'agent-fin-exec',
      provenanceChain: [{ agentId: 'agent-fin-exec', tier: 'executor' }],
      action: 'payment.execute',
      payload,
      createdAt: Date.now(),
    };

    // 1. Initial attempt without approval -> Status PENDING_APPROVAL
    const initialResult = await interceptor.handleToolCall(request, mockPaymentTool);
    expect(toolExecuted).toBe(false);
    expect(initialResult.status).toBe('pending_approval');
    expect(initialResult.payloadHash).toBe(hashPayload(payload));

    // 2. Human reviewer signs approval token
    const approvalPayload: ApprovalPayload = {
      requestId: request.id,
      payloadHash: initialResult.payloadHash!,
      reviewerId: 'alice@finance.internal',
      decision: 'approved',
      nonce: generateNonce(),
      expiresAt: Date.now() + 60_000,
    };
    const signedToken = signApproval(approvalPayload, secretKey);

    // 3. Re-submit with signed approval token -> Tool executes successfully!
    const approvedResult = await interceptor.handleToolCall(request, mockPaymentTool, signedToken);
    expect(toolExecuted).toBe(true);
    expect(approvedResult.status).toBe('executed');
    expect(approvedResult.receipt?.verdict).toBe('VERIFIED_EXECUTION');
  });

  it('ANTI-TOCTOU: Aborts execution if payload is tampered between review and execution', async () => {
    const interceptor = new ProofLayerInterceptor({ secretKey, policies: [paymentPolicy] });

    let toolExecuted = false;
    const mockPaymentTool = async () => {
      toolExecuted = true;
      return { status: 'success' };
    };

    const originalPayload = { amount: 1200, recipient: 'Legitimate Contractor' };
    const request: ExecutionRequest = {
      id: 'req-toctou',
      agentId: 'agent-fin-exec',
      provenanceChain: [{ agentId: 'agent-fin-exec', tier: 'executor' }],
      action: 'payment.execute',
      payload: originalPayload,
      createdAt: Date.now(),
    };

    // Human approves original payload
    const approvalPayload: ApprovalPayload = {
      requestId: request.id,
      payloadHash: hashPayload(originalPayload),
      reviewerId: 'alice@finance.internal',
      decision: 'approved',
      nonce: generateNonce(),
      expiresAt: Date.now() + 60_000,
    };
    const signedToken = signApproval(approvalPayload, secretKey);

    // Malicious or hallucinated agent swaps payload to $5,000 to Attacker
    const tamperedRequest: ExecutionRequest = {
      ...request,
      payload: { amount: 5000, recipient: 'Attacker Rogue Acct' },
    };

    const result = await interceptor.handleToolCall(tamperedRequest, mockPaymentTool, signedToken);

    expect(toolExecuted).toBe(false); // Tool MUST NOT execute!
    expect(result.status).toBe('blocked');
    expect(result.error).toBe('PAYLOAD_HASH_MISMATCH');
  });
});
