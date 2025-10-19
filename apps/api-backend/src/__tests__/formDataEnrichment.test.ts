import { pickFirstNonEmpty, computeNormalizedIdentity } from '../utils/formDataEnrichment';

describe('pickFirstNonEmpty', () => {
  it('returns first non-empty trimmed string', () => {
    expect(pickFirstNonEmpty(undefined, '', '  ', 'John', 'Doe')).toBe('John');
  });
  it('returns undefined if all are empty', () => {
    expect(pickFirstNonEmpty(undefined, null as any, '', '   ')).toBeUndefined();
  });
});

describe('computeNormalizedIdentity', () => {
  it('uses clientData when complete', () => {
    const res = computeNormalizedIdentity({
      clientData: { email: 'USER@Example.com', firstName: 'Alice', lastName: 'Liddell', phone: '+3312345' },
      piMetadata: { email: 'stripe@example.com', firstName: 'S', lastName: 'T' },
      orderData: { email: 'order@example.com' },
      userDoc: { email: 'userdoc@example.com' },
    });
    expect(res).toEqual({ email: 'user@example.com', firstName: 'Alice', lastName: 'Liddell', phone: '+3312345' });
  });

  it('falls back to Stripe metadata when client missing', () => {
    const res = computeNormalizedIdentity({
      clientData: {},
      piMetadata: { email: 'stripe.person@example.com', firstName: 'Stripe', lastName: 'Person', phone: '0600000000' },
      orderData: {},
      userDoc: {},
    });
    expect(res).toEqual({ email: 'stripe.person@example.com', firstName: 'Stripe', lastName: 'Person', phone: '0600000000' });
  });

  it('uses email-only to build name fallbacks', () => {
    const res = computeNormalizedIdentity({
      clientData: { email: 'onlymail@example.org' },
      piMetadata: {},
      orderData: {},
      userDoc: {},
    });
    // firstName from local-part, lastName default
    expect(res).toEqual({ email: 'onlymail@example.org', firstName: 'onlymail', lastName: 'Stripe', phone: undefined });
  });
});

