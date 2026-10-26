import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

const HOST = process.env.AURAPAY_HOST || '127.0.0.1';
const PORT = Number(process.env.AURAPAY_PORT || 8787);
const ACCOUNT_ID = 'aurapay-demo-alex';
const ACCOUNT_NAME = 'alex@aurapay.demo';
const ACCOUNT_DISPLAY_NAME = 'Alex - AuraPay Demo Account';
const STORE_PATH = resolve('server/data/passkeys.json');
const pending = new Map();

async function loadStore() {
  try {
    return JSON.parse(await readFile(STORE_PATH, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { accountId: ACCOUNT_ID, credentials: [] };
  }
}

async function saveStore(store) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 32_000) throw new Error('Request is too large.');
  }
  return raw ? JSON.parse(raw) : {};
}

function assertLocalOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) throw new Error('A browser origin is required. Open AuraPay from its local Vite address.');
  const parsed = new URL(origin);
  const allowedOrigins = new Set((process.env.AURAPAY_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5175').split(',').map((value) => value.trim()));
  if (parsed.hostname !== 'localhost' || !allowedOrigins.has(origin)) {
    throw new Error('WebAuthn requires the localhost name in this demo. Open http://localhost:5175/ (not 127.0.0.1).');
  }
  return { origin, rpID: 'localhost' };
}

function validIntent(input) {
  const amount = Number(input?.amount);
  const recipient = String(input?.recipient ?? '').trim();
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    throw new Error('Passkey verification requires a valid demo payment amount up to ₹1 crore.');
  }
  if (!recipient || recipient.length > 160) throw new Error('The payment recipient is missing or invalid.');
  return { amount, recipient };
}

function validKind(value) {
  if (value !== 'synced' && value !== 'security-key') throw new Error('Choose a synced passkey or a FIDO2 security key.');
  return value;
}

function storedKind(entry) {
  return entry.kind ?? (entry.deviceType === 'multiDevice' && entry.backedUp ? 'synced' : 'security-key');
}
function rememberChallenge(flowId, state) {
  pending.set(flowId, { ...state, expiresAt: Date.now() + 5 * 60 * 1000 });
}

function takeChallenge(flowId, expectedPurpose) {
  const state = pending.get(flowId);
  pending.delete(flowId);
  if (!state || state.expiresAt < Date.now() || state.purpose !== expectedPurpose) {
    throw new Error('This security challenge expired or was already used. Start the passkey step again.');
  }
  return state;
}

async function handle(req, res) {
  if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true, service: 'aurapay-passkey-demo' });
  if (req.method !== 'POST' || !req.url?.startsWith('/api/passkey/')) return json(res, 404, { error: 'Not found.' });
  let body;
  let webOrigin;
  try {
    body = await readBody(req);
    webOrigin = assertLocalOrigin(req);
    const store = await loadStore();
    const credentials = store.credentials ?? [];

    if (req.url === '/api/passkey/status') {
      const kinds = credentials.map(storedKind);
        return json(res, 200, {
          account: ACCOUNT_DISPLAY_NAME,
          apiVersion: 'account-credentials-v2',
          enrolled: credentials.length > 0,
          passkeyCount: credentials.length,
          syncedPasskeyEnrolled: kinds.includes('synced'),
          securityKeyEnrolled: kinds.includes('security-key'),
        });
    }

    if (req.url === '/api/passkey/register/options') {
      const intent = validIntent(body.intent);
      const kind = validKind(body.kind);
      const isSecurityKey = kind === 'security-key';
      const options = await generateRegistrationOptions({
        rpName: 'AuraPay Demo',
        rpID: webOrigin.rpID,
        userID: new TextEncoder().encode(ACCOUNT_ID),
        userName: ACCOUNT_NAME,
        userDisplayName: ACCOUNT_DISPLAY_NAME,
        attestationType: 'none',
        excludeCredentials: credentials.map((entry) => ({ id: entry.id, transports: entry.transports })),
        authenticatorSelection: isSecurityKey
          ? { authenticatorAttachment: 'cross-platform', residentKey: 'preferred', userVerification: 'required' }
          : { residentKey: 'required', userVerification: 'required' },
        hints: isSecurityKey ? ['security-key'] : ['client-device', 'hybrid'],
        preferredAuthenticatorType: isSecurityKey ? 'securityKey' : undefined,
        supportedAlgorithmIDs: [-7, -257],
        timeout: 120_000,
      });
      const flowId = randomUUID();
      rememberChallenge(flowId, { purpose: 'registration', challenge: options.challenge, intent, kind });
      return json(res, 200, { flowId, options });
    }

    if (req.url === '/api/passkey/register/verify') {
      const state = takeChallenge(String(body.flowId ?? ''), 'registration');
      const verification = await verifyRegistrationResponse({
        response: body.credential,
        expectedChallenge: state.challenge,
        expectedOrigin: webOrigin.origin,
        expectedRPID: webOrigin.rpID,
        requireUserVerification: true,
        supportedAlgorithmIDs: [-7, -257],
      });
      if (!verification.verified || !verification.registrationInfo) throw new Error('The passkey could not be verified by AuraPay.');
      const info = verification.registrationInfo;
      if (state.kind === 'synced' && (info.credentialDeviceType !== 'multiDevice' || !info.credentialBackedUp)) {
        throw new Error('This provider reports a device-only passkey. Choose a synced account passkey or select the security-key option.');
      }
      if (state.kind === 'security-key' && body.credential?.authenticatorAttachment !== 'cross-platform') {
        throw new Error('The browser did not use an external security key. Insert a FIDO2/WebAuthn USB or NFC security key and try again.');
      }
      const credential = info.credential;
      const item = {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: body.credential?.response?.transports ?? [],
        kind: state.kind,
        deviceType: info.credentialDeviceType,
        backedUp: info.credentialBackedUp,
      };
      store.credentials.push(item);
      await saveStore(store);
      return json(res, 200, { verified: true, enrolled: true, kind: state.kind, synced: state.kind === 'synced' && info.credentialBackedUp, account: ACCOUNT_DISPLAY_NAME, intent: state.intent });
    }

    if (req.url === '/api/passkey/authentication/options') {
      const intent = validIntent(body.intent);
      const kind = validKind(body.kind);
      const selected = credentials.filter((entry) => storedKind(entry) === kind);
      if (selected.length === 0) return json(res, 409, { error: `No ${kind === 'synced' ? 'synced account passkey' : 'security key'} is enrolled. Create one for this option first.` });
      const options = await generateAuthenticationOptions({
        rpID: webOrigin.rpID,
        allowCredentials: selected.map((entry) => ({ id: entry.id, transports: entry.transports })),
        userVerification: 'required',
        hints: kind === 'security-key' ? ['security-key'] : ['client-device', 'hybrid'],
        timeout: 120_000,
      });
      const flowId = randomUUID();
      rememberChallenge(flowId, { purpose: 'authentication', challenge: options.challenge, intent, kind });
      return json(res, 200, { flowId, options });
    }

    if (req.url === '/api/passkey/authentication/verify') {
      const state = takeChallenge(String(body.flowId ?? ''), 'authentication');
      const responseId = body.credential?.id;
      const item = credentials.find((entry) => entry.id === responseId && storedKind(entry) === state.kind);
      if (!item) throw new Error('That credential is not enrolled for this AuraPay account and verification option.');
      const verification = await verifyAuthenticationResponse({
        response: body.credential,
        expectedChallenge: state.challenge,
        expectedOrigin: webOrigin.origin,
        expectedRPID: webOrigin.rpID,
        credential: {
          id: item.id,
          publicKey: new Uint8Array(Buffer.from(item.publicKey, 'base64url')),
          counter: item.counter,
          transports: item.transports,
        },
        requireUserVerification: true,
      });
      if (!verification.verified) throw new Error('The server did not verify the passkey signature. Payment authorization did not advance.');
      item.counter = verification.authenticationInfo.newCounter;
      await saveStore(store);
      return json(res, 200, {
        verified: true,
        account: ACCOUNT_DISPLAY_NAME,
        intent: state.intent,
        kind: state.kind,
        passkeyDeviceType: item.deviceType,
        synced: storedKind(item) === 'synced' && item.backedUp,
      });
    }
    return json(res, 404, { error: 'Unknown passkey operation.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Passkey verification failed.';
    const status = message.includes('No synced account passkey') || message.includes('No security key') ? 409 : 400;
    return json(res, status, { error: message });
  }
}

const server = createServer((req, res) => { void handle(req, res); });
server.listen(PORT, HOST, () => console.log(`AuraPay passkey API listening at http://${HOST}:${PORT}`));

function stop() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 3_000).unref();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);













