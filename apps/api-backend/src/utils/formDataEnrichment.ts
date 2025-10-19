export function pickFirstNonEmpty(...vals: Array<string | undefined | null>): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

export interface IdentityInputs {
  clientData?: any;
  piMetadata?: any;
  orderData?: any;
  userDoc?: any;
}

export function computeNormalizedIdentity({ clientData = {}, piMetadata = {}, orderData = {}, userDoc = {} }: IdentityInputs) {
  const email = (pickFirstNonEmpty(
    clientData.email,
    piMetadata.email,
    orderData.email,
    userDoc.email
  ) || '').toLowerCase();

  const firstNameFallbackFromEmail = email && email.includes('@') ? email.split('@')[0] : undefined;

  const firstName = pickFirstNonEmpty(
    clientData.firstName,
    piMetadata.firstName,
    orderData.firstName,
    userDoc.firstName,
    firstNameFallbackFromEmail,
    'Client'
  )!;

  const lastName = pickFirstNonEmpty(
    clientData.lastName,
    piMetadata.lastName,
    orderData.lastName,
    userDoc.lastName,
    'Stripe'
  )!;

  const phone = pickFirstNonEmpty(
    clientData.phone,
    piMetadata.phone,
    orderData.phone,
    userDoc.phone
  );

  return { email, firstName, lastName, phone };
}

