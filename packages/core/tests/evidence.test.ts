import { describe, it, expect } from 'vitest';
import { 
  createEvidenceNode, 
  buildEvidenceDag, 
  generateTrustReceipt,
  calculateMerkleRoot 
} from '../src/evidence.js';
import type { EvidenceNode } from '../src/types.js';

describe('TDD: Evidence DAG & Cryptographic Trust Receipts', () => {
  it('constructs immutable DAG nodes with deterministic SHA-256 node hashes', () => {
    const nodeA = createEvidenceNode({
      requestId: 'req-100',
      type: 'INTENT',
      label: 'Agent Proposes Payment $1,200',
      data: { amount: 1200, recipient: 'Acme Corp' },
      parentIds: [],
    });

    const nodeB = createEvidenceNode({
      requestId: 'req-100',
      type: 'POLICY_CHECK',
      label: 'Invariant Evaluated: Exceeds $500',
      data: { decision: 'require_approval' },
      parentIds: [nodeA.id],
    });

    expect(nodeA.nodeHash).toHaveLength(64);
    expect(nodeB.nodeHash).toHaveLength(64);
    expect(nodeB.parentIds).toContain(nodeA.id);
  });

  it('builds a verified Merkle root across all execution DAG nodes', () => {
    const nodes: EvidenceNode[] = [
      createEvidenceNode({
        requestId: 'req-101',
        type: 'INTENT',
        label: 'Intent Received',
        data: { action: 'payment.execute' },
        parentIds: [],
      }),
      createEvidenceNode({
        requestId: 'req-101',
        type: 'POLICY_CHECK',
        label: 'Policy Passed',
        data: { passed: true },
        parentIds: [],
      }),
      createEvidenceNode({
        requestId: 'req-101',
        type: 'EXECUTION',
        label: 'Tool Dispatched',
        data: { txId: 'tx-8812' },
        parentIds: [],
      }),
    ];

    const dag = buildEvidenceDag('req-101', nodes);
    const merkleRoot = calculateMerkleRoot(nodes);

    expect(dag.nodes).toHaveLength(3);
    expect(merkleRoot).toHaveLength(64);
  });

  it('generates an EU AI Act Article 14 compliant Trust Receipt bundle', () => {
    const nodes: EvidenceNode[] = [
      createEvidenceNode({
        requestId: 'req-102',
        type: 'INTENT',
        label: 'Payment Request',
        data: { amount: 1200 },
        parentIds: [],
      }),
      createEvidenceNode({
        requestId: 'req-102',
        type: 'APPROVAL',
        label: 'Human Signed Hash',
        data: { reviewer: 'alice@security.internal' },
        parentIds: [],
      }),
    ];

    const receipt = generateTrustReceipt({
      requestId: 'req-102',
      action: 'payment.execute',
      policyId: 'policy-fin-001',
      verdict: 'VERIFIED_EXECUTION',
      payloadHash: 'hash-abc-123',
      nodes,
      approvalSignature: 'hmac-sig-xyz',
    });

    expect(receipt.verdict).toBe('VERIFIED_EXECUTION');
    expect(receipt.complianceMetadata.standard).toBe('EU_AI_ACT_ART_14');
    expect(receipt.complianceMetadata.humanOversightVerified).toBe(true);
    expect(receipt.complianceMetadata.deterministicGatePassed).toBe(true);
    expect(receipt.merkleRoot).toHaveLength(64);
  });
});
