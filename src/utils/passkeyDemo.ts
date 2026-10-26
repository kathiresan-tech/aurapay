import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

export type CredentialKind = 'synced' | 'security-key';
type PaymentIntent = { amount: number; recipient: string };
type ApiResult<T> = T & { error?: string };
type PasskeyStatus = {
  account: string;
  passkeyCount: number;
  syncedPasskeyEnrolled: boolean;
  securityKeyEnrolled: boolean;
};

async function api<T>(path: string, body: unknown = {}): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  let payload: ApiResult<T>;
  try {
    payload = raw ? JSON.parse(raw) as ApiResult<T> : {} as ApiResult<T>;
  } catch {
    throw new Error(`The local passkey service returned an unreadable response (HTTP ${response.status}). Stop any old Vite session, then start this project with npm run dev.`);
  }
  if (!response.ok) throw new Error(payload.error || `Passkey service returned HTTP ${response.status}. Start the full demo with npm run dev.`);
  return payload;
}

export function passkeyAvailable(): boolean {
  return window.isSecureContext && 'credentials' in navigator && typeof window.PublicKeyCredential !== 'undefined';
}

export async function getPasskeyStatus(): Promise<PasskeyStatus> {
  const status = await api<PasskeyStatus & { apiVersion?: string }>('/api/passkey/status');
  if (status.apiVersion !== 'account-credentials-v2' || typeof status.syncedPasskeyEnrolled !== 'boolean' || typeof status.securityKeyEnrolled !== 'boolean') {
    throw new Error('The passkey service is out of date. Stop the old server, then restart this project with npm run dev.');
  }
  return status;
}

/** Registers or authenticates one server-verified credential for this exact payment intent. */
export async function finishHighValuePasskeyFlow(
  amount: number,
  recipient: string,
  kind: CredentialKind,
): Promise<{ account: string; enrolledNow: boolean; kind: CredentialKind }> {
  if (!passkeyAvailable()) {
    throw new Error('WebAuthn requires a supported browser on localhost or HTTPS. Try Chrome or Edge.');
  }
  const intent: PaymentIntent = { amount, recipient };
  const status = await getPasskeyStatus();
  const enrolled = kind === 'synced' ? status.syncedPasskeyEnrolled : status.securityKeyEnrolled;

  if (!enrolled) {
    const registration = await api<{
      flowId: string;
      options: Parameters<typeof startRegistration>[0]['optionsJSON'];
    }>('/api/passkey/register/options', { intent, kind });
    const credential = await startRegistration({ optionsJSON: registration.options });
    const result = await api<{
      verified: boolean;
      synced: boolean;
      kind: CredentialKind;
      intent: PaymentIntent;
      account: string;
    }>('/api/passkey/register/verify', { flowId: registration.flowId, credential });
    const methodVerified = kind === 'synced' ? result.synced : result.kind === 'security-key';
    if (!result.verified || !methodVerified || result.kind !== kind || result.intent.amount !== amount || result.intent.recipient !== recipient) {
      throw new Error('The server did not verify this credential for the exact payment. The payment has not advanced.');
    }
    return { account: result.account, enrolledNow: true, kind };
  }

  const authentication = await api<{
    flowId: string;
    options: Parameters<typeof startAuthentication>[0]['optionsJSON'];
  }>('/api/passkey/authentication/options', { intent, kind });
  const credential = await startAuthentication({ optionsJSON: authentication.options });
  const result = await api<{
    verified: boolean;
    synced: boolean;
    kind: CredentialKind;
    intent: PaymentIntent;
    account: string;
  }>('/api/passkey/authentication/verify', { flowId: authentication.flowId, credential });
  const methodVerified = kind === 'synced' ? result.synced : result.kind === 'security-key';
  if (!result.verified || !methodVerified || result.kind !== kind || result.intent.amount !== amount || result.intent.recipient !== recipient) {
    throw new Error('The server did not verify this credential for the exact payment. The payment has not advanced.');
  }
  return { account: result.account, enrolledNow: false, kind };
}

