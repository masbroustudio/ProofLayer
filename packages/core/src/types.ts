/**
 * ProofLayer Core Types & Invariant Specifications
 * Engineered for Well-Architected Framework: Security, Zero-Trust, and <2ms Latency
 */

export type ActionPattern = string;

export type InvariantOperator = 
  | 'lte' 
  | 'gte' 
  | 'eq' 
  | 'neq' 
  | 'in' 
  | 'not_in' 
  | 'regex';

export type InvariantFailureAction = 'deny' | 'require_approval';

export interface InvariantRule {
  id: string;
  field: string;
  operator: InvariantOperator;
  value: any;
  failureAction: InvariantFailureAction;
  failureMessage: string;
}

export interface PolicyAST {
  id: string;
  name: string;
  version: number;
  actionPattern: ActionPattern;
  requiredPrivilegeTier?: string;
  invariants: InvariantRule[];
}

export type EvaluationDecision = 'allow' | 'deny' | 'require_approval';

export interface EvaluationResult {
  decision: EvaluationDecision;
  policyId: string;
  policyVersion: number;
  reason: string;
  failedInvariants: string[];
  latencyMs: number;
}

export interface AgentProvenanceToken {
  agentId: string;
  tier: 'untrusted_reader' | 'worker' | 'executor' | 'admin';
  delegatedBy?: string;
}

export interface ExecutionRequest {
  id: string;
  agentId: string;
  provenanceChain: AgentProvenanceToken[];
  action: string;
  payload: Record<string, any>;
  payloadHash?: string;
  createdAt: number;
}

export interface ApprovalPayload {
  requestId: string;
  payloadHash: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  nonce: string;
  expiresAt: number;
}

export interface SignedApprovalToken {
  approval: ApprovalPayload;
  signature: string;
}

export type EvidenceNodeType = 
  | 'INTENT' 
  | 'POLICY_CHECK' 
  | 'APPROVAL' 
  | 'EXECUTION' 
  | 'TRUST_RECEIPT';

export interface EvidenceNode {
  id: string;
  requestId: string;
  type: EvidenceNodeType;
  label: string;
  data: Record<string, any>;
  parentIds: string[];
  nodeHash: string;
  timestamp: number;
}

export interface TrustReceipt {
  receiptId: string;
  requestId: string;
  action: string;
  policyId: string;
  verdict: 'VERIFIED_EXECUTION' | 'PREVENTED_VIOLATION';
  payloadHash: string;
  merkleRoot: string;
  approvalSignature?: string;
  executionTimestamp: number;
  complianceMetadata: {
    standard: 'EU_AI_ACT_ART_14' | 'SOC2_TYPE2';
    humanOversightVerified: boolean;
    deterministicGatePassed: boolean;
    zeroBlastRadiusEnforced: boolean;
  };
}
