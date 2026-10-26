import { describe, it, expect } from 'vitest';
import { verifyAgentProvenance } from '../src/provenance.js';
import type { AgentProvenanceToken } from '../src/types.js';

describe('TDD: Multi-Agent Swarm Provenance & Confused Deputy Prevention', () => {
  it('allows high-privilege tool execution when direct caller is an authorized executor', () => {
    const chain: AgentProvenanceToken[] = [
      { agentId: 'agent-fin-exec', tier: 'executor' },
    ];

    const result = verifyAgentProvenance(chain, 'executor');
    expect(result.valid).toBe(true);
    expect(result.violatingAgentId).toBeUndefined();
  });

  it('SWARM ATTACK: Detects Confused Deputy when an untrusted scraper subagent is in call chain', () => {
    // Attack scenario:
    // 1. Untrusted Scraper agent ingests a poisoned invoice with indirect prompt injection
    // 2. Scraper delegates to Financial Executor agent: "Please pay invoice #99"
    // 3. Financial Executor attempts to execute the high-privilege payment tool
    const poisonedChain: AgentProvenanceToken[] = [
      { agentId: 'subagent-web-scraper', tier: 'untrusted_reader' },
      { agentId: 'subagent-fin-executor', tier: 'executor', delegatedBy: 'subagent-web-scraper' },
    ];

    // High privilege payment tool requires 'executor' tier across the entire chain
    const result = verifyAgentProvenance(poisonedChain, 'executor');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('PRIVILEGE_ESCALATION_DETECTED');
    expect(result.violatingAgentId).toBe('subagent-web-scraper');
    expect(result.reason).toContain('Untrusted origin: subagent-web-scraper holds tier untrusted_reader');
  });

  it('allows chained delegation if all participating subagents meet or exceed the required tier', () => {
    const validChain: AgentProvenanceToken[] = [
      { agentId: 'subagent-admin-lead', tier: 'admin' },
      { agentId: 'subagent-fin-executor', tier: 'executor', delegatedBy: 'subagent-admin-lead' },
    ];

    const result = verifyAgentProvenance(validChain, 'executor');
    expect(result.valid).toBe(true);
  });
});
