import type { PolicyAST, InvariantRule, EvaluationResult, EvaluationDecision } from './types.js';

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
}

function checkOperator(actual: any, operator: InvariantRule['operator'], expected: any): boolean {
  switch (operator) {
    case 'lte':
      return typeof actual === 'number' && actual <= expected;
    case 'gte':
      return typeof actual === 'number' && actual >= expected;
    case 'eq':
      return actual === expected;
    case 'neq':
      return actual !== expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(actual);
    case 'regex':
      return typeof actual === 'string' && new RegExp(expected).test(actual);
    default:
      return false;
  }
}

/**
 * Evaluates deterministic Policy AST invariants in <2ms with zero token cost.
 * Fails closed on missing or malformed fields.
 */
export function evaluateInvariants(policy: PolicyAST, payload: Record<string, any>): EvaluationResult {
  const start = performance.now();
  let decision: EvaluationDecision = 'allow';
  const failedInvariants: string[] = [];
  const reasons: string[] = [];

  for (const inv of policy.invariants) {
    const actual = getNestedValue(payload, inv.field);

    if (actual === undefined || actual === null) {
      // Mandatory field missing: Fail-closed to deny
      decision = 'deny';
      failedInvariants.push(inv.id);
      reasons.push(`Missing required field: ${inv.field}`);
      continue;
    }

    const passed = checkOperator(actual, inv.operator, inv.value);
    if (!passed) {
      failedInvariants.push(inv.id);
      reasons.push(inv.failureMessage);

      if (inv.failureAction === 'deny') {
        decision = 'deny';
      } else if (inv.failureAction === 'require_approval' && decision !== 'deny') {
        decision = 'require_approval';
      }
    }
  }

  const latencyMs = Number((performance.now() - start).toFixed(4));

  return {
    decision,
    policyId: policy.id,
    policyVersion: policy.version,
    reason: reasons.length > 0 ? reasons.join('; ') : 'All invariants verified successfully',
    failedInvariants,
    latencyMs,
  };
}
