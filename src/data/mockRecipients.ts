import { P2PRecipient, PaymentPurpose, FirstPaymentSafetyCheck } from '../types/assistant';

export const KNOWN_DEMO_RECIPIENTS: Record<string, P2PRecipient> = {
  'rahul.sharma@okhdfcbank': {
    upiId: 'rahul.sharma@okhdfcbank',
    resolvedName: 'RAHUL SHARMA',
    bankName: 'HDFC Bank Ltd.',
    accountMatched: true,
    matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
    suggestedAmount: 500,
  },
  'priya.verma@icici': {
    upiId: 'priya.verma@icici',
    resolvedName: 'PRIYA VERMA',
    bankName: 'ICICI Bank Ltd.',
    accountMatched: true,
    matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
    suggestedAmount: 1200,
  },
  'urban.services@axisbank': {
    upiId: 'urban.services@axisbank',
    resolvedName: 'URBAN HOME CLEANING SERVICES',
    bankName: 'Axis Bank Ltd.',
    accountMatched: true,
    matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
    suggestedAmount: 750,
  },
  'claim.reward2026@paytm': {
    upiId: 'claim.reward2026@paytm',
    resolvedName: 'REWARD DISBURSEMENT DESK (KUMAR TRADERS)',
    bankName: 'Paytm Payments Bank',
    accountMatched: true,
    matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
    suggestedAmount: 500,
    isCommonScamTarget: true,
  },
  'hr.parttime.jobs@ybl': {
    upiId: 'hr.parttime.jobs@ybl',
    resolvedName: 'GLOBAL RECRUITMENT AGENCY PRIVATE ENTITY',
    bankName: 'YES Bank Ltd.',
    accountMatched: true,
    matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
    suggestedAmount: 1000,
    isCommonScamTarget: true,
  },
};

export function resolveUpiRecipient(inputUpi: string, fallbackAmount?: number): P2PRecipient {
  const normalized = inputUpi.trim().toLowerCase();
  if (KNOWN_DEMO_RECIPIENTS[normalized]) {
    return KNOWN_DEMO_RECIPIENTS[normalized];
  }

  const handle = normalized.split('@')[0] || 'account.user';
  const provider = normalized.split('@')[1] || 'upi';

  let bankName = 'State Bank of India';
  if (provider.includes('hdfc')) bankName = 'HDFC Bank Ltd.';
  else if (provider.includes('icici')) bankName = 'ICICI Bank Ltd.';
  else if (provider.includes('axis')) bankName = 'Axis Bank Ltd.';
  else if (provider.includes('paytm')) bankName = 'Paytm Payments Bank';
  else if (provider.includes('ybl') || provider.includes('yes')) bankName = 'YES Bank Ltd.';
  else if (provider.includes('okbizaxis')) bankName = 'Axis Bank (Merchant)';

  const formattedName = handle
    .replace(/[._0-9-]/g, ' ')
    .trim()
    .toUpperCase() || 'DEMO ACCOUNT HOLDER';

  return {
    upiId: normalized.includes('@') ? normalized : `${normalized}@okhdfcbank`,
    resolvedName: formattedName,
    bankName,
    accountMatched: true,
    matchType: 'ACCOUNT_NAME_MATCHED_ONLY',
    suggestedAmount: fallbackAmount || 500,
  };
}

export function evaluateSafetyCheck(
  purpose: PaymentPurpose,
  isPressured: boolean,
  recipientName: string,
  rawPromptText?: string
): FirstPaymentSafetyCheck {
  const warnings: string[] = [];
  let score: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

  const textLower = (rawPromptText || '').toLowerCase();

  if (
    purpose === 'prize_lottery' ||
    textLower.includes('prize') ||
    textLower.includes('lottery') ||
    textLower.includes('gift card') ||
    textLower.includes('won')
  ) {
    score = 'CRITICAL';
    warnings.push(
      '🚨 SCAM WARNING (Prize / Lottery Advance-Fee Scam): Genuine prizes, lotteries, and contests NEVER require you to pay a registration fee, processing charge, or tax upfront via UPI.'
    );
  }

  if (
    purpose === 'refund_deposit' ||
    textLower.includes('refund') ||
    textLower.includes('reverse') ||
    textLower.includes('reversal') ||
    textLower.includes('claim money')
  ) {
    score = 'CRITICAL';
    warnings.push(
      '🚨 SCAM WARNING (Fake Refund / Reversal Scam): Legitimate banks, e-commerce platforms, and merchants NEVER ask you to SEND money or enter your UPI PIN to receive a refund. Remember: UPI PIN is ONLY used to DEBIT your account, never to receive money!'
    );
  }

  if (
    purpose === 'job_registration' ||
    textLower.includes('job') ||
    textLower.includes('task') ||
    textLower.includes('part-time') ||
    textLower.includes('salary') ||
    textLower.includes('freelance')
  ) {
    score = 'CRITICAL';
    warnings.push(
      '🚨 SCAM WARNING (Employment / Work-From-Home Task Scam): Legitimate companies and HR recruiters will NEVER ask candidates to pay an upfront onboarding fee, security deposit, or equipment charge to start work.'
    );
  }

  if (isPressured) {
    if (score !== 'CRITICAL') score = 'HIGH';
    warnings.push(
      '⚠️ COERCION / URGENCY ALERT: Someone instructing you on a live phone call or chat is the #1 tactic used by fraudsters to rush victims before they can verify facts. Take a breath and disconnect the call.'
    );
  }

  if (
    purpose === 'online_marketplace' ||
    textLower.includes('olx') ||
    textLower.includes('quikr') ||
    textLower.includes('marketplace')
  ) {
    if (score === 'LOW') score = 'MEDIUM';
    warnings.push(
      '💡 Marketplace Safety Notice: Verify goods in person before transferring funds. Fraudsters often pose as army personnel or urgent buyers sending fake payment confirmation screenshots.'
    );
  }

  if (score === 'LOW') {
    warnings.push(
      'Account name match confirmed with demo lookup. However, remember that UPI transfers cannot be recalled or charged back once authorized.'
    );
  }

  return {
    purpose,
    isPressured,
    scamRiskScore: score,
    warnings,
    acknowledgedWarning: false,
  };
}
