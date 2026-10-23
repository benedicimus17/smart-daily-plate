import { describe, it, expect } from 'vitest';
import {
  generateIntegritySignature,
  verifyLicenseIntegrity,
  issueAuthorizedReceipt,
  SignedLicenseReceipt
} from '../cryptoSecurity';

describe('Cryptographic License & Offline Anti-Tamper Verification', () => {
  it('generates a valid signed receipt for PRO user that passes verification', async () => {
    const receipt = await issueAuthorizedReceipt('user_test_uuid_123', 'pro_monthly', 30);
    expect(receipt).toBeDefined();
    expect(receipt.integrityHash).toBeDefined();
    expect(receipt.payload.tier).toBe('pro_monthly');

    const result = await verifyLicenseIntegrity(receipt);
    expect(result.isValid).toBe(true);
    expect(result.isPro).toBe(true);
  });

  it('detects and BLOCKS offline tampering when expiration date or tier is modified', async () => {
    const genuineReceipt = await issueAuthorizedReceipt('user_test_uuid_456', 'pro_monthly', 30);

    // Attacker tries to modify tier in memory or localStorage
    const tamperedReceipt: SignedLicenseReceipt = {
      payload: {
        ...genuineReceipt.payload,
        tier: 'pro_annual' // Tampered tier without matching hash
      },
      integrityHash: genuineReceipt.integrityHash
    };

    const result = await verifyLicenseIntegrity(tamperedReceipt);
    expect(result.isValid).toBe(false);
    expect(result.isPro).toBe(false);
    expect(result.reason).toBe('TAMPER_DETECTED');
  });

  it('detects and BLOCKS license when expiration date has passed', async () => {
    // Manually construct an expired receipt
    const expiredPayload = {
      userId: 'user_test_expired',
      tier: 'pro_monthly' as const,
      issuedAt: '2025-01-01T00:00:00.000Z',
      expiresAt: '2025-02-01T00:00:00.000Z',
      features: ['chef_hub_unlimited', 'smart_swap_ai', 'cloud_sync', 'offline_vault']
    };
    const hash = await generateIntegritySignature(expiredPayload);

    const expiredReceipt: SignedLicenseReceipt = {
      payload: expiredPayload,
      integrityHash: hash
    };

    const result = await verifyLicenseIntegrity(expiredReceipt);
    expect(result.isValid).toBe(false);
    expect(result.isPro).toBe(false);
    expect(result.reason).toBe('EXPIRED');
  });

  it('rejects null or missing receipts cleanly', async () => {
    const result = await verifyLicenseIntegrity(null);
    expect(result.isValid).toBe(false);
    expect(result.isPro).toBe(false);
    expect(result.reason).toBe('NO_RECEIPT');
  });
});
