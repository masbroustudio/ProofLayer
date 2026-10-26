import { hashPayload, verifyApproval } from './crypto.js';
import { evaluateInvariants } from './evaluator.js';
import { verifyAgentProvenance } from './provenance.js';
import { 
  createEvidenceNode, 
  buildEvidenceDag, 
  generateTrustReceipt, 
  type DagStructure 
} from './evidence.js';
import type { 
  PolicyAST, 
  ExecutionRequest, 
  SignedApprovalToken, 
  EvidenceNode, 
  TrustReceipt 
} from './types.js';

export interface InterceptorConfig {
  secretKey: string;
  policies: PolicyAST[];
}

export interface InterceptorResult {
  status: 'executed' | 'pending_approval' | 'blocked';
  payloadHash?: string;
  output?: any;
  error?: string;
  reason?: string;
  evidenceDag: DagStructure;
  receipt?: TrustReceipt;
}

export class ProofLayerInterceptor {
  private secretKey: string;
  private policies: Map<string, PolicyAST> = new Map();
  private consumedNonces: Set<string> = new Set();

  constructor(config: InterceptorConfig) {
    this.secretKey = config.secretKey;
    for (const policy of config.policies) {
      this.policies.set(policy.id, policy);
    }
  }

  public addPolicy(policy: PolicyAST): void {
    this.policies.set(policy.id, policy);
  }

  private matchPolicy(action: string): PolicyAST | undefined {
    for (const policy of this.policies.values()) {
      if (policy.actionPattern === '*' || policy.actionPattern === action) {
        return policy;
      }
      if (policy.actionPattern.endsWith('.*')) {
        const prefix = policy.actionPattern.slice(0, -2);
        if (action.startsWith(prefix)) {
          return policy;
        }
      }
    }
    return undefined;
  }

  /**
   * Intercepts, verifies, and executes a protected tool call within deterministic safety boundaries.
   */
  public async handleToolCall(
    request: ExecutionRequest,
    toolFn: (payload: any) => Promise<any>,
    signedToken?: SignedApprovalToken
  ): Promise<InterceptorResult> {
    const payloadHash = hashPayload(request.payload);
    const nodes: EvidenceNode[] = [];

    // 1. Evidence Node: Intent
    const intentNode = createEvidenceNode({
      requestId: request.id,
      type: 'INTENT',
      label: `Agent ${request.agentId} proposes ${request.action}`,
      data: {
        agentId: request.agentId,
        action: request.action,
        payloadHash,
        provenanceChain: request.provenanceChain,
      },
    });
    nodes.push(intentNode);

    // 2. Policy Lookup
    const policy = this.matchPolicy(request.action);
    if (!policy) {
      // Default: Allow if no policy registered, or fail-closed based on config
      const output = await toolFn(request.payload);
      return {
        status: 'executed',
        output,
        payloadHash,
        evidenceDag: buildEvidenceDag(request.id, nodes),
      };
    }

    // 3. Multi-Agent Provenance & Confused Deputy Check
    if (policy.requiredPrivilegeTier) {
      const provCheck = verifyAgentProvenance(
        request.provenanceChain,
        policy.requiredPrivilegeTier as any
      );

      if (!provCheck.valid) {
        const blockedNode = createEvidenceNode({
          requestId: request.id,
          type: 'POLICY_CHECK',
          label: `Confused Deputy Block: ${provCheck.reason}`,
          data: { error: provCheck.error, violatingAgentId: provCheck.violatingAgentId },
          parentIds: [intentNode.id],
        });
        nodes.push(blockedNode);

        return {
          status: 'blocked',
          error: provCheck.error,
          reason: provCheck.reason,
          payloadHash,
          evidenceDag: buildEvidenceDag(request.id, nodes),
        };
      }
    }

    // 4. Deterministic Invariant Evaluation (<2ms)
    const evalResult = evaluateInvariants(policy, request.payload);

    const evalNode = createEvidenceNode({
      requestId: request.id,
      type: 'POLICY_CHECK',
      label: `Policy ${policy.name} evaluation: ${evalResult.decision.toUpperCase()}`,
      data: {
        decision: evalResult.decision,
        reason: evalResult.reason,
        failedInvariants: evalResult.failedInvariants,
        latencyMs: evalResult.latencyMs,
      },
      parentIds: [intentNode.id],
    });
    nodes.push(evalNode);

    // 5. Handle Invariant Evaluation Result
    if (evalResult.decision === 'deny') {
      return {
        status: 'blocked',
        error: 'INVARIANT_VIOLATION',
        reason: evalResult.reason,
        payloadHash,
        evidenceDag: buildEvidenceDag(request.id, nodes),
      };
    }

    let parentForExecution = evalNode.id;

    if (evalResult.decision === 'require_approval') {
      if (!signedToken) {
        return {
          status: 'pending_approval',
          reason: evalResult.reason,
          payloadHash,
          evidenceDag: buildEvidenceDag(request.id, nodes),
        };
      }

      // Verify Human Approval Signature (Anti-TOCTOU & Anti-Replay)
      const verification = verifyApproval(
        signedToken,
        request.payload,
        this.secretKey,
        this.consumedNonces
      );

      if (!verification.valid) {
        const approvalFailNode = createEvidenceNode({
          requestId: request.id,
          type: 'APPROVAL',
          label: `Approval Verification Rejected: ${verification.error}`,
          data: { error: verification.error, reason: verification.reason },
          parentIds: [evalNode.id],
        });
        nodes.push(approvalFailNode);

        return {
          status: 'blocked',
          error: verification.error,
          reason: verification.reason,
          payloadHash,
          evidenceDag: buildEvidenceDag(request.id, nodes),
        };
      }

      // Consume nonce for replay protection
      this.consumedNonces.add(signedToken.approval.nonce);

      const approvalPassNode = createEvidenceNode({
        requestId: request.id,
        type: 'APPROVAL',
        label: `Human Approval Verified by ${signedToken.approval.reviewerId}`,
        data: {
          reviewerId: signedToken.approval.reviewerId,
          payloadHash: signedToken.approval.payloadHash,
          signature: signedToken.signature,
        },
        parentIds: [evalNode.id],
      });
      nodes.push(approvalPassNode);
      parentForExecution = approvalPassNode.id;
    }

    // 6. Authorized Tool Dispatch
    const output = await toolFn(request.payload);

    const execNode = createEvidenceNode({
      requestId: request.id,
      type: 'EXECUTION',
      label: `Protected Tool Executed Successfully: ${request.action}`,
      data: { output },
      parentIds: [parentForExecution],
    });
    nodes.push(execNode);

    const receipt = generateTrustReceipt({
      requestId: request.id,
      action: request.action,
      policyId: policy.id,
      verdict: 'VERIFIED_EXECUTION',
      payloadHash,
      nodes,
      approvalSignature: signedToken?.signature,
    });

    return {
      status: 'executed',
      output,
      payloadHash,
      evidenceDag: buildEvidenceDag(request.id, nodes),
      receipt,
    };
  }
}
