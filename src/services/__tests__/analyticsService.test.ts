import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackEvent,
  getStoredEvents,
  clearTelemetryEvents,
  isTelemetryEnabled,
  setTelemetryConsent,
  getTelemetryStats,
  exportTelemetryJson,
  sanitizeProperties,
  getAnonymousSessionId,
  getSafeStorage
} from '../analyticsService';

describe('analyticsService - GDPR-Compliant Local Product Analytics', () => {
  beforeEach(() => {
    getSafeStorage('local').clear();
    getSafeStorage('session').clear();
  });

  it('generates consistent anonymous session ID within session', () => {
    const s1 = getAnonymousSessionId();
    const s2 = getAnonymousSessionId();
    expect(s1).toBeTruthy();
    expect(s1).toBe(s2);
    expect(s1).toMatch(/^sess_/);
  });

  it('tracks an event with non-PII properties', () => {
    const evt = trackEvent('meal_reality_swapped', {
      presetName: '2 круасани з кавою',
      calories: 640,
      mealType: 'lunch'
    });

    expect(evt).not.toBeNull();
    expect(evt?.name).toBe('meal_reality_swapped');
    expect(evt?.properties?.presetName).toBe('2 круасани з кавою');
    expect(evt?.properties?.calories).toBe(640);

    const stored = getStoredEvents();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(evt?.id);
  });

  it('sanitizes and strips forbidden PII keys (email, phone, fullName, pin)', () => {
    const rawProps = {
      email: 'secret@victim.com',
      fullName: 'John Doe',
      phone: '+380501234567',
      pin: '1234',
      validMetric: 'vegetarian',
      stepsCount: 5
    };

    const sanitized = sanitizeProperties(rawProps);
    expect(sanitized).toBeDefined();
    expect(sanitized?.email).toBeUndefined();
    expect(sanitized?.fullName).toBeUndefined();
    expect(sanitized?.phone).toBeUndefined();
    expect(sanitized?.pin).toBeUndefined();
    expect(sanitized?.validMetric).toBe('vegetarian');
    expect(sanitized?.stepsCount).toBe(5);
  });

  it('respects user opt-out (GDPR right to refuse tracking)', () => {
    trackEvent('water_logged', { amountMl: 250 });
    expect(getStoredEvents().length).toBe(1);

    // Disable telemetry
    setTelemetryConsent(false);
    expect(isTelemetryEnabled()).toBe(false);

    // Stored events are immediately wiped upon opt-out
    expect(getStoredEvents().length).toBe(0);

    // New events are rejected
    const evt = trackEvent('barcode_scanned', { barcode: '8480000123456' });
    expect(evt).toBeNull();
    expect(getStoredEvents().length).toBe(0);
  });

  it('computes aggregated telemetry stats correctly', () => {
    trackEvent('water_logged', { amountMl: 250 });
    trackEvent('water_logged', { amountMl: 250 });
    trackEvent('pro_modal_viewed', { trigger: 'chef_recipe' });

    const stats = getTelemetryStats();
    expect(stats.totalEvents).toBe(3);
    expect(stats.isEnabled).toBe(true);
    expect(stats.countsByName.water_logged).toBe(2);
    expect(stats.countsByName.pro_modal_viewed).toBe(1);
    expect(stats.lastEventTimestamp).toBeTruthy();
  });

  it('exports valid formatted GDPR JSON string', () => {
    trackEvent('social_card_shared', { format: 'story' });
    const jsonStr = exportTelemetryJson();
    const parsed = JSON.parse(jsonStr);

    expect(parsed.service).toBe('NUTRIQ Anonymous Telemetry Engine');
    expect(parsed.gdprCompliant).toBe(true);
    expect(parsed.piiCollected).toBe(false);
    expect(parsed.events.length).toBe(1);
    expect(parsed.events[0].name).toBe('social_card_shared');
  });

  it('clears all events when clearTelemetryEvents is called', () => {
    trackEvent('onboarding_started');
    trackEvent('onboarding_completed');
    expect(getStoredEvents().length).toBe(2);

    clearTelemetryEvents();
    expect(getStoredEvents().length).toBe(0);
    expect(getTelemetryStats().totalEvents).toBe(0);
  });
});
