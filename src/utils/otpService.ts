/** Local-only OTP demonstration helper. This module never sends SMS or stores secrets. */
const DEMO_CODE = '849201';

export function getSavedApiKey(): string {
  return '';
}

export function saveApiKey(_key: string): void {
  // Intentionally disabled in this prototype.
}

export function getSavedMobile(): string {
  return '';
}

export function saveMobile(_mobile: string): void {
  // No phone number is collected or stored by the prototype.
}

export function generateOTP(): string {
  return DEMO_CODE;
}

export interface OTPSendResult {
  success: boolean;
  error?: string;
  isSimulated?: boolean;
}

export async function sendOTP(_mobile: string, _otp: string): Promise<OTPSendResult> {
  return { success: true, isSimulated: true };
}
