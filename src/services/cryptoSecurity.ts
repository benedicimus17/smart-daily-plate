/**
 * NUTRIQ Security & Anti-Tamper Engine
 * Protects PRO subscription status against DevTools and offline memory manipulation.
 */

export interface ProLicensePayload {
  userId: string;
  tier: 'free' | 'pro_monthly' | 'pro_annual';
  expiresAt: string; // ISO 8601
  features: string[];
  issuedAt: string;
}

export interface SignedLicenseReceipt {
  payload: ProLicensePayload;
  integrityHash: string; // SHA-256 equivalent HMAC signature
}

// Client-side verification salt (matches server-side rotation policy)
const CLIENT_VERIFY_SALT = 'NUTRIQ_CORE_V1_ANTI_TAMPER_SECRET_SALT_2026';

/**
 * Deterministic SHA-256 hash generator using Web Crypto API
 */
export async function generateIntegritySignature(payload: ProLicensePayload): Promise<string> {
  const serialized = `${payload.userId}|${payload.tier}|${payload.expiresAt}|${payload.features.sort().join(',')}|${payload.issuedAt}|${CLIENT_VERIFY_SALT}`;
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback deterministic hash for test environments without subtle crypto
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Validates whether an offline PRO license receipt is genuine and not expired.
 * Prevents localStorage editing of `isPro: true`.
 */
export async function verifyLicenseIntegrity(receipt: SignedLicenseReceipt | null): Promise<{
  isValid: boolean;
  isPro: boolean;
  reason?: string;
}> {
  if (!receipt || !receipt.payload || !receipt.integrityHash) {
    return { isValid: false, isPro: false, reason: 'NO_RECEIPT' };
  }

  const { payload, integrityHash } = receipt;

  // 1. Check expiration date
  const now = new Date();
  const expiresDate = new Date(payload.expiresAt);
  if (now > expiresDate) {
    return { isValid: false, isPro: false, reason: 'EXPIRED' };
  }

  // 2. Check cryptographic signature integrity
  const expectedHash = await generateIntegritySignature(payload);
  if (expectedHash !== integrityHash) {
    return { isValid: false, isPro: false, reason: 'TAMPER_DETECTED' };
  }

  // 3. Check tier status
  const isProTier = payload.tier === 'pro_monthly' || payload.tier === 'pro_annual';
  return { isValid: true, isPro: isProTier };
}

/**
 * Generates an authorized receipt when subscription is verified or renewed.
 */
export async function issueAuthorizedReceipt(
  userId: string,
  tier: 'pro_monthly' | 'pro_annual',
  durationDays: number = 30
): Promise<SignedLicenseReceipt> {
  const now = new Date();
  const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const payload: ProLicensePayload = {
    userId,
    tier,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    features: ['chef_hub_unlimited', 'smart_swap_ai', 'cloud_sync', 'offline_vault']
  };

  const integrityHash = await generateIntegritySignature(payload);
  return { payload, integrityHash };
}
