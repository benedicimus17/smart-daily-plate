import { describe, it, expect, beforeEach } from 'vitest';
import {
  STRIPE_PLANS,
  initiateSubscriptionCheckout,
  getStoredLicenseReceipt,
  cancelActiveSubscription
} from '../stripeBilling';
import { verifyLicenseIntegrity } from '../cryptoSecurity';

// Setup mock localStorage for Node/Vitest environment
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, val: string) => {
    memoryStore[key] = val;
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
  clear: () => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  }
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = mockLocalStorage as unknown as Storage;
}

describe('Stripe Billing & Subscription Engine', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('defines correct European Euro pricing for monthly and annual plans', () => {
    expect(STRIPE_PLANS.monthly.priceEur).toBe(4.99);
    expect(STRIPE_PLANS.monthly.trialDays).toBe(7);
    expect(STRIPE_PLANS.yearly.priceEur).toBe(35.99);
    expect(STRIPE_PLANS.yearly.monthlyEquivalent).toBe(2.99);
    expect(STRIPE_PLANS.yearly.trialDays).toBe(7);
  });

  it('initiates subscription checkout and issues a cryptographically signed license', async () => {
    const result = await initiateSubscriptionCheckout({
      planId: 'yearly',
      userId: 'test_user_uuid_777',
      userEmail: 'user@example.com'
    });

    expect(result.success).toBe(true);
    expect(result.receipt).toBeDefined();
    expect(result.receipt?.payload.tier).toBe('pro_annual');

    // Verify cryptographic integrity of issued license
    const verification = await verifyLicenseIntegrity(result.receipt || null);
    expect(verification.isValid).toBe(true);
    expect(verification.isPro).toBe(true);

    // Verify receipt was saved in storage
    const stored = getStoredLicenseReceipt();
    expect(stored).toEqual(result.receipt);
  });

  it('handles monthly subscription activation correctly', async () => {
    const result = await initiateSubscriptionCheckout({
      planId: 'monthly',
      userId: 'test_user_monthly',
      userEmail: 'monthly@nutriq.app'
    });

    expect(result.success).toBe(true);
    expect(result.receipt?.payload.tier).toBe('pro_monthly');

    const verification = await verifyLicenseIntegrity(result.receipt || null);
    expect(verification.isValid).toBe(true);
    expect(verification.isPro).toBe(true);
  });

  it('cancels active subscription and cleans stored receipts', async () => {
    await initiateSubscriptionCheckout({
      planId: 'monthly',
      userId: 'cancel_user',
      userEmail: 'cancel@nutriq.app'
    });

    expect(getStoredLicenseReceipt()).not.toBeNull();

    await cancelActiveSubscription('cancel_user');
    expect(getStoredLicenseReceipt()).toBeNull();
  });
});
