import { createHash, createHmac, randomBytes } from 'node:crypto';
import type { ApprovalPayload, SignedApprovalToken } from './types.js';

/**
 * Deterministically sorts all object keys recursively and serializes to JSON string.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`
  );
  return '{' + entries.join(',') + '}';
}

/**
 * Generates SHA-256 hex digest of the canonicalized JSON payload.
 */
export function hashPayload(payload: Record<string, any>): string {
  const canonical = canonicalizeJson(payload);
  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Generates an unpredictable 32-character random hex nonce.
 */
export function generateNonce(): string {
  return randomBytes(16).toString('hex');
}

function constructSignableMessage(approval: ApprovalPayload): string {
  return [
    approval.requestId,
    approval.payloadHash,
    approval.reviewerId,
    approval.decision,
    approval.nonce,
    approval.expiresAt.toString(),
  ].join('::');
}

/**
 * Signs an ApprovalPayload using HMAC-SHA256.
 */
export function signApproval(approval: ApprovalPayload, secretKey: string): SignedApprovalToken {
  const message = constructSignableMessage(approval);
  const signature = createHmac('sha256', secretKey).update(message).digest('hex');
  return { approval, signature };
}

export interface VerificationResult {
  valid: boolean;
  error?: 'TOKEN_EXPIRED' | 'NONCE_ALREADY_CONSUMED' | 'INVALID_SIGNATURE' | 'PAYLOAD_HASH_MISMATCH';
  reason?: string;
}

/**
 * Verifies a SignedApprovalToken against the current tool payload:
 * 1. Checks timestamp expiration.
 * 2. Checks nonce replay against consumedNonces set.
 * 3. Checks cryptographic signature integrity.
 * 4. Checks that payload hash matches current payload SHA-256 (Anti-TOCTOU).
 */
export function verifyApproval(
  signedToken: SignedApprovalToken,
  payloadToExecute: Record<string, any>,
  secretKey: string,
  consumedNonces?: Set<string>
): VerificationResult {
  const { approval, signature } = signedToken;

  // 1. Expiration check
  if (Date.now() > approval.expiresAt) {
    return { valid: false, error: 'TOKEN_EXPIRED', reason: 'Approval token has expired' };
  }

  // 2. Replay check
  if (consumedNonces && consumedNonces.has(approval.nonce)) {
    return { valid: false, error: 'NONCE_ALREADY_CONSUMED', reason: 'Nonce has already been used' };
  }

  // 3. Cryptographic signature check
  const expectedMessage = constructSignableMessage(approval);
  const expectedSignature = createHmac('sha256', secretKey).update(expectedMessage).digest('hex');
  if (signature !== expectedSignature) {
    return { valid: false, error: 'INVALID_SIGNATURE', reason: 'HMAC signature verification failed' };
  }

  // 4. Anti-TOCTOU payload hash check
  const currentPayloadHash = hashPayload(payloadToExecute);
  if (currentPayloadHash !== approval.payloadHash) {
    return {
      valid: false,
      error: 'PAYLOAD_HASH_MISMATCH',
      reason: `Payload was modified after approval. Expected hash: ${approval.payloadHash}, received: ${currentPayloadHash}`,
    };
  }

  return { valid: true };
}
