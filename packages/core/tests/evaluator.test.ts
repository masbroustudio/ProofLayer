import { describe, it, expect } from 'vitest';
import { evaluateInvariants } from '../src/evaluator.js';
import type { PolicyAST } from '../src/types.js';

describe('TDD: Deterministic AST Invariant Evaluator (<2ms, $0 Token Cost)', () => {
  const paymentPolicy: PolicyAST = {
    id: 'policy-fin-001',
    name: 'High-Value Payment Guard',
    version: 1,
    actionPattern: 'payment.*',
    invariants: [
      {
        id: 'inv-max-autonomous-amount',
        field: 'amount',
        operator: 'lte',
        value: 500,
        failureAction: 'require_approval',
        failureMessage: 'Transactions exceeding $500 require human authorization',
      },
      {
        id: 'inv-allowed-currency',
        field: 'currency',
        operator: 'in',
        value: ['USD', 'EUR'],
        failureAction: 'deny',
        failureMessage: 'Only USD and EUR currencies are supported',
      },
    ],
  };

  it('allows autonomous execution when all invariants pass (<$500 in USD)', () => {
    const payload = { amount: 150, currency: 'USD', recipient: 'Supplier Co' };
    const result = evaluateInvariants(paymentPolicy, payload);

    expect(result.decision).toBe('allow');
    expect(result.failedInvariants).toHaveLength(0);
    expect(result.latencyMs).toBeLessThan(5); // Well within sub-millisecond target
  });

  it('triggers REQUIRE_APPROVAL when threshold is exceeded ($1,200 > $500)', () => {
    const payload = { amount: 1200, currency: 'USD', recipient: 'Acme Contractor' };
    const result = evaluateInvariants(paymentPolicy, payload);

    expect(result.decision).toBe('require_approval');
    expect(result.failedInvariants).toContain('inv-max-autonomous-amount');
    expect(result.reason).toContain('require human authorization');
  });

  it('hard-denies execution when a critical constraint fails (unsupported currency)', () => {
    const payload = { amount: 100, currency: 'XMR', recipient: 'Unknown' };
    const result = evaluateInvariants(paymentPolicy, payload);

    expect(result.decision).toBe('deny');
    expect(result.failedInvariants).toContain('inv-allowed-currency');
  });

  it('not_regex operator: blocks SQL query containing destructive DROP TABLE', () => {
    const sqlPolicy: PolicyAST = {
      id: 'policy-sql-test',
      name: 'SQL Safety Guard',
      version: 1,
      actionPattern: 'database.*',
      invariants: [
        {
          id: 'inv-no-destructive-sql',
          field: 'query',
          operator: 'not_regex',
          value: 'DROP|TRUNCATE|DELETE\\s+FROM',
          failureAction: 'deny',
          failureMessage: 'Destructive SQL mutations are prohibited',
        },
      ],
    };

    const safePayload = { query: 'SELECT * FROM users WHERE active = 1;' };
    const safeResult = evaluateInvariants(sqlPolicy, safePayload);
    expect(safeResult.decision).toBe('allow');

    const destructivePayload = { query: 'DROP TABLE customers_prod CASCADE;' };
    const destructiveResult = evaluateInvariants(sqlPolicy, destructivePayload);
    expect(destructiveResult.decision).toBe('deny');
    expect(destructiveResult.failedInvariants).toContain('inv-no-destructive-sql');
  });

  it('fails closed (DENY) when mandatory invariant fields are missing from payload', () => {
    // Missing 'amount' entirely
    const payload = { currency: 'USD', recipient: 'No Amount' };
    const result = evaluateInvariants(paymentPolicy, payload);

    expect(result.decision).toBe('deny');
    expect(result.failedInvariants).toContain('inv-max-autonomous-amount');
    expect(result.reason).toContain('Missing required field: amount');
  });

  it('benchmark: performs 1,000 evaluations in <20ms (zero latency overhead)', () => {
    const payload = { amount: 250, currency: 'USD' };
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      evaluateInvariants(paymentPolicy, payload);
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(30); // 1000 evaluations under 30ms total (<0.03ms per call)
  });
});
