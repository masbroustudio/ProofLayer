import { describe, it, expect } from 'vitest';
import { 
  canonicalizeJson, 
  hashPayload, 
  signApproval, 
  verifyApproval,
  generateNonce 
} from '../src/crypto.js';
import type { ApprovalPayload } from '../src/types.js';

describe('TDD: Cryptographic Primitives & Anti-TOCTOU Protection', () => {
  const secretKey = 'test-secret-key-prooflayer-2026';

  it('produces identical SHA-256 hash regardless of object key ordering', () => {
    const payloadA = { amount: 1200, recipient: 'Acme Corp', currency: 'USD' };
    const payloadB = { currency: 'USD', recipient: 'Acme Corp', amount: 1200 };

    const hashA = hashPayload(payloadA);
    const hashB = hashPayload(payloadB);

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64); // Valid SHA-256 hex string
  });

  it('signs and verifies a valid human approval token', () => {
    const payload = { amount: 1200, recipient: 'Acme Corp', currency: 'USD' };
    const payloadHash = hashPayload(payload);
    const nonce = generateNonce();

    const approval: ApprovalPayload = {
      requestId: 'req-001',
      payloadHash,
      reviewerId: 'alice@security.internal',
      decision: 'approved',
      nonce,
      expiresAt: Date.now() + 60_000,
    };

    const token = signApproval(approval, secretKey);
    const verification = verifyApproval(token, payload, secretKey);

    expect(verification.valid).toBe(true);
    expect(verification.reason).toBeUndefined();
  });

  it('ANTI-TOCTOU: Fails verification if payload parameters are mutated after approval', () => {
    const originalPayload = { amount: 1200, recipient: 'Acme Corp', currency: 'USD' };
    const originalHash = hashPayload(originalPayload);
    const nonce = generateNonce();

    const approval: ApprovalPayload = {
      requestId: 'req-002',
      payloadHash: originalHash,
      reviewerId: 'alice@security.internal',
      decision: 'approved',
      nonce,
      expiresAt: Date.now() + 60_000,
    };

    const token = signApproval(approval, secretKey);

    // Attacker or hallucinated agent mutates amount to $5,000 or alters recipient
    const tamperedPayload = { amount: 5000, recipient: 'Acme Corp', currency: 'USD' };
    const verification = verifyApproval(token, tamperedPayload, secretKey);

    expect(verification.valid).toBe(false);
    expect(verification.error).toBe('PAYLOAD_HASH_MISMATCH');
  });

  it('ANTI-REPLAY: Fails verification if a nonce has already been consumed', () => {
    const payload = { amount: 50, recipient: 'Stripe Refund' };
    const nonce = generateNonce();

    const approval: ApprovalPayload = {
      requestId: 'req-003',
      payloadHash: hashPayload(payload),
      reviewerId: 'bob@ops.internal',
      decision: 'approved',
      nonce,
      expiresAt: Date.now() + 60_000,
    };

    const token = signApproval(approval, secretKey);

    // Simulate consumed nonces store
    const consumedNonces = new Set<string>();
    
    // First verification consumes nonce
    const firstVerify = verifyApproval(token, payload, secretKey, consumedNonces);
    expect(firstVerify.valid).toBe(true);
    consumedNonces.add(nonce);

    // Second verification with same nonce must be rejected
    const replayVerify = verifyApproval(token, payload, secretKey, consumedNonces);
    expect(replayVerify.valid).toBe(false);
    expect(replayVerify.error).toBe('NONCE_ALREADY_CONSUMED');
  });

  it('rejects expired approval tokens', () => {
    const payload = { amount: 100 };
    const approval: ApprovalPayload = {
      requestId: 'req-004',
      payloadHash: hashPayload(payload),
      reviewerId: 'charlie@ops.internal',
      decision: 'approved',
      nonce: generateNonce(),
      expiresAt: Date.now() - 1000, // Expired 1 second ago
    };

    const token = signApproval(approval, secretKey);
    const verification = verifyApproval(token, payload, secretKey);

    expect(verification.valid).toBe(false);
    expect(verification.error).toBe('TOKEN_EXPIRED');
  });
});
