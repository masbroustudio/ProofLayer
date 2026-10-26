import type { AgentProvenanceToken } from './types.js';

const TIER_HIERARCHY: Record<AgentProvenanceToken['tier'], number> = {
  untrusted_reader: 1,
  worker: 2,
  executor: 3,
  admin: 4,
};

export interface ProvenanceResult {
  valid: boolean;
  error?: 'PRIVILEGE_ESCALATION_DETECTED' | 'EMPTY_PROVENANCE_CHAIN';
  violatingAgentId?: string;
  reason?: string;
}

/**
 * Enforces Zero-Trust policy across multi-agent swarms.
 * Inspects the entire delegation chain to prevent Confused Deputy exploits.
 */
export function verifyAgentProvenance(
  chain: AgentProvenanceToken[],
  requiredTier: AgentProvenanceToken['tier']
): ProvenanceResult {
  if (!chain || chain.length === 0) {
    return {
      valid: false,
      error: 'EMPTY_PROVENANCE_CHAIN',
      reason: 'No agent identity or provenance token provided in tool call',
    };
  }

  const requiredScore = TIER_HIERARCHY[requiredTier] ?? 3;

  for (const token of chain) {
    const agentScore = TIER_HIERARCHY[token.tier] ?? 0;
    if (agentScore < requiredScore) {
      return {
        valid: false,
        error: 'PRIVILEGE_ESCALATION_DETECTED',
        violatingAgentId: token.agentId,
        reason: `Untrusted origin: ${token.agentId} holds tier ${token.tier}, which is below required ${requiredTier}`,
      };
    }
  }

  return { valid: true };
}
