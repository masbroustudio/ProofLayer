import { createClient, type Client } from '@libsql/client';
import type { PolicyAST } from '@prooflayer/core';

export function initDb(url: string = 'file:prooflayer.sqlite'): Client {
  const client = createClient({ url });
  return client;
}

export async function runMigrations(client: Client): Promise<void> {
  await client.execute('PRAGMA foreign_keys = ON;');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      action_pattern TEXT NOT NULL,
      required_privilege_tier TEXT,
      compiled_ast TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS execution_requests (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      provenance_chain TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_requests_hash ON execution_requests(payload_hash);
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_requests_status ON execution_requests(status);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS policy_evaluations (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      policy_id TEXT NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT NOT NULL,
      failed_invariants TEXT,
      evaluation_latency_ms REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      decision TEXT NOT NULL,
      nonce TEXT NOT NULL UNIQUE,
      signature TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS evidence_nodes (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      data TEXT NOT NULL,
      parent_ids TEXT NOT NULL,
      node_hash TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_evidence_request ON evidence_nodes(request_id);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tool_executions (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      output_result TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(request_id) REFERENCES execution_requests(id) ON DELETE CASCADE
    );
  `);

  // Seed default 2026 policies
  await seedDefaultPolicies(client);
}

export const DEFAULT_PAYMENT_POLICY: PolicyAST = {
  id: 'policy-fin-001',
  name: 'Autonomous Payment Guard (Max $500)',
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
      failureMessage: 'Transactions exceeding $500 USD require cryptographically signed human authorization',
    },
    {
      id: 'inv-currency-usd',
      field: 'currency',
      operator: 'in',
      value: ['USD', 'EUR'],
      failureAction: 'deny',
      failureMessage: 'Only USD and EUR transactions are supported',
    },
  ],
};

export const DEFAULT_CLOUD_POLICY: PolicyAST = {
  id: 'policy-cloud-001',
  name: 'Critical Infrastructure Gate (Zero Blast Radius)',
  version: 1,
  actionPattern: 'cloud.*',
  requiredPrivilegeTier: 'admin',
  invariants: [
    {
      id: 'inv-no-prod-teardown',
      field: 'environment',
      operator: 'neq',
      value: 'production',
      failureAction: 'deny',
      failureMessage: 'Autonomous agents are prohibited from teardown actions in production environment',
    },
  ],
};

export const DEFAULT_SQL_POLICY: PolicyAST = {
  id: 'policy-sql-001',
  name: 'Production Database Mutation Guard',
  version: 1,
  actionPattern: 'database.mutate',
  requiredPrivilegeTier: 'admin',
  invariants: [
    {
      id: 'inv-no-destructive-sql',
      field: 'query',
      operator: 'not_regex',
      value: 'DROP|TRUNCATE|DELETE\\s+FROM',
      failureAction: 'deny',
      failureMessage: 'Destructive SQL operations (DROP/TRUNCATE/DELETE) are strictly prohibited on database',
    },
    {
      id: 'inv-prod-mutation-gate',
      field: 'environment',
      operator: 'neq',
      value: 'production',
      failureAction: 'require_approval',
      failureMessage: 'Mutations targeting production environment require explicit Dual-SecOps sign-off',
    },
  ],
};

export const DEFAULT_EXFIL_POLICY: PolicyAST = {
  id: 'policy-exfil-001',
  name: 'Outbound PII & Secret Exfiltration Guard',
  version: 1,
  actionPattern: 'network.*',
  requiredPrivilegeTier: 'worker',
  invariants: [
    {
      id: 'inv-no-leaked-secrets',
      field: 'body',
      operator: 'not_regex',
      value: 'sk-[a-zA-Z0-9_-]{10,}|\\b\\d{3}-\\d{2}-\\d{4}\\b|password=',
      failureAction: 'deny',
      failureMessage: 'Outbound payload contains detected API secrets (sk-...) or PII (SSN). Blocked by Zero-Trust DLP boundary.',
    },
  ],
};

async function seedDefaultPolicies(client: Client): Promise<void> {
  const policies = [
    DEFAULT_PAYMENT_POLICY, 
    DEFAULT_CLOUD_POLICY, 
    DEFAULT_SQL_POLICY, 
    DEFAULT_EXFIL_POLICY
  ];

  for (const policy of policies) {
    await client.execute({
      sql: `
        INSERT OR IGNORE INTO policies (id, name, version, status, action_pattern, required_privilege_tier, compiled_ast, created_at)
        VALUES (?, ?, ?, 'active', ?, ?, ?, ?);
      `,
      args: [
        policy.id,
        policy.name,
        policy.version,
        policy.actionPattern,
        policy.requiredPrivilegeTier || null,
        JSON.stringify(policy),
        Date.now(),
      ],
    });
  }
}
