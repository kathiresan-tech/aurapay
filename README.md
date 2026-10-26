# AuraPay — payment safety demo

AuraPay is a standalone front-end prototype with a local WebAuthn passkey service. It does not connect to UPI, banks, SMS, or live merchant registries. No real payment is sent. Contacts, recipients, bills, merchant records, risk labels, and the demo account are sample data.

## Demo flows

- **Pay to my friends:** choose from the fictional contact list and review its sample UPI ID and demo profile label.
- **Pay to merchant:** choose a sample merchant or enter a UPI ID. A match is only against the local demo directory; it does not prove a real merchant is genuine.
- **Pay new user:** enter a sample UPI ID and review the simulated name-match and first-payment safety prompts. No bank lookup occurs.
- **Call-safety advisory:** use the Call-safety demo controls to simulate a call. A warning appears when payment is attempted during the call or within 10 minutes after it ends. The user can cancel or continue; the warning never blocks payment. Call state is simulated because a browser cannot reliably read system call state.
- **High-value and split payments:** payments of ₹10,000 or more require 2-step verification. Smaller payments also require it when completed payments to the same recipient would reach ₹10,000 within a rolling 20 hours, when this would be the third payment to that recipient in 20 hours, or when the same amount would be sent three times. Only completed demo transactions count; history is saved in this browser local storage. This is a prototype rule, not a bank-side fraud decision.
- **Payments above ₹10,000:** the user reviews the amount and recipient, confirms intent, then creates or uses a passkey. The local server validates WebAuthn challenges and signatures, requires user verification, and binds the verified assertion to that amount and recipient. The browser or passkey provider may use fingerprint, face recognition, or the device screen lock. AuraPay does not receive biometric data.

## Passkey demo details

This is one fixed demo account, `alex@aurapay.demo`. Users can enroll both of these credential types, each tied to the selected high-value payment:

- **Synced passkey:** the passkey manager must report a backed-up, multi-device credential. Sync is handled by the user's Google, Apple, or password-manager account, not AuraPay.
- **External security key:** choose this option for a FIDO2/WebAuthn USB or NFC security key. It must support user verification (usually a key PIN or built-in biometric); a regular flash drive will not work. The security-key PIN is separate from the UPI PIN. The browser is asked for a cross-platform authenticator and a security-key prompt.

The server stores public keys, counters, and credential type. Private keys and biometrics stay with their authenticator/provider. The prototype requests no hardware attestation, so it demonstrates an external-key WebAuthn flow but does not certify the key's manufacturer or model. Local JSON storage is for a single demo server; multi-device real-world use would require a shared protected account database and account recovery.

The account is not backed by real identity verification or a bank. The passkey step is a working local WebAuthn demonstration, not a UPI authorization and not production payment security. A real payment product would need authenticated bank accounts, secure account enrollment and recovery, a production service with durable protected storage, and an authorized payment-network integration.

## Run locally

1. Install Node.js 22.12 or newer.
2. Open a terminal in this folder.
3. Run `npm install` if dependencies are not installed.
4. Run `npm run dev`. This starts the local passkey API and the Vite website together.
5. Open `http://localhost:5175/`. Keep the terminal open while using the demo. WebAuthn needs the hostname `localhost`; do not use `127.0.0.1` for passkey creation.

Use `localhost` exactly. An IP address such as `127.0.0.1` is not a valid WebAuthn relying-party domain in this demo. To make a production build, run `npm run build`.

The server's demo passkey public-key records are written to `server/data/passkeys.json` and are ignored by Git.





