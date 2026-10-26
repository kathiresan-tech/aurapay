import { BillerCategory } from '../types/assistant';
import { DEMO_VERIFIED_BILLERS } from '../data/mockBillers';
import { resolveUpiRecipient } from '../data/mockRecipients';

export interface ParsedIntent {
  type: 'BILL' | 'P2P' | 'FRIENDS' | 'MERCHANT' | 'NEW_USER' | 'UNKNOWN';
  rawQuery: string;
  category?: BillerCategory;
  billerId?: string;
  recipientUpi?: string;
  resolvedRecipient?: ReturnType<typeof resolveUpiRecipient>;
  amount?: number;
  note?: string;
  consumerNumberCandidate?: string;
  detectedScamKeywords?: string[];
  isHighValue?: boolean; // > 10,000
  assistantResponse: string;
}

export function parseUserQuery(query: string): ParsedIntent {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // Extract amount if present
  let amount: number | undefined;
  const amountMatch = clean.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i);
  if (amountMatch && amountMatch[1]) {
    const rawVal = amountMatch[1].replace(/,/g, '');
    const num = parseFloat(rawVal);
    if (num > 0 && num < 1000000 && !query.match(new RegExp(`consumer\\s*(?:no|number)?\\s*${rawVal}`, 'i'))) {
      if (
        clean.match(/(?:pay|send|transfer|amount|₹|rs|inr)\s*(?:of\s*)?([0-9]+)/i) ||
        num <= 50000
      ) {
        amount = num;
      }
    }
  }

  const isHighValue = amount !== undefined && amount > 10000;

  // Check for UPI handle
  const upiMatch = clean.match(/([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/);
  const recipientUpi = upiMatch ? upiMatch[1] : undefined;

  // Scam keywords detection
  const scamWords = [
    'prize',
    'lottery',
    'won',
    'reward claim',
    'refund',
    'reversal',
    'job fee',
    'registration fee',
    'task fee',
    'part-time job',
    'deposit to receive',
  ];
  const detectedScamKeywords = scamWords.filter((w) => lower.includes(w));

  // 1. Check for "Pay to my friends" or friends list
  if (
    lower.includes('friend') ||
    lower.includes('contact') ||
    lower.includes('buddies') ||
    lower.includes('pay to my friends')
  ) {
    return {
      type: 'FRIENDS',
      rawQuery: clean,
      amount,
      isHighValue,
      assistantResponse:
        'Here are the UPI IDs of friends from your contact list. I have verified their bank KYC and safety status.',
    };
  }

  // 2. Check for "Pay to Merchant"
  if (
    lower.includes('merchant') ||
    lower.includes('store') ||
    lower.includes('shop') ||
    lower.includes('vendor') ||
    lower.includes('freshmart') ||
    lower.includes('medplus')
  ) {
    return {
      type: 'MERCHANT',
      rawQuery: clean,
      amount,
      isHighValue,
      assistantResponse:
        'I can show sample merchant profiles. Any match is simulated and does not verify GSTIN or business registration.',
    };
  }

  // 3. Check for "Pay new user"
  if (
    lower.includes('new user') ||
    lower.includes('new person') ||
    lower.includes('pay new') ||
    lower.includes('someone new') ||
    lower.includes('unknown')
  ) {
    return {
      type: 'NEW_USER',
      rawQuery: clean,
      amount,
      isHighValue,
      assistantResponse:
        'Please enter the new user’s UPI ID or mobile number. We will run an account name match lookup and first-payment safety screening.',
    };
  }

  // 4. Utility Bill Payment
  const isExplicitBill =
    lower.includes('bill') ||
    lower.includes('electricity') ||
    lower.includes('water') ||
    lower.includes('gas') ||
    lower.includes('broadband') ||
    lower.includes('wifi') ||
    lower.includes('power') ||
    lower.includes('bijli') ||
    lower.includes('bescom') ||
    lower.includes('adani') ||
    lower.includes('tata power') ||
    lower.includes('jal board') ||
    lower.includes('igl') ||
    lower.includes('mgl') ||
    lower.includes('jiofiber') ||
    lower.includes('airtel');

  if (isExplicitBill && !recipientUpi) {
    let category: BillerCategory = 'electricity';
    if (lower.includes('water') || lower.includes('jal') || lower.includes('bwssb')) {
      category = 'water';
    } else if (lower.includes('gas') || lower.includes('igl') || lower.includes('mgl') || lower.includes('cylinder') || lower.includes('png')) {
      category = 'gas';
    } else if (lower.includes('broadband') || lower.includes('wifi') || lower.includes('fiber') || lower.includes('internet')) {
      category = 'broadband';
    } else {
      category = 'electricity';
    }

    const matchedBiller = DEMO_VERIFIED_BILLERS.find(
      (b) =>
        lower.includes(b.shortName.toLowerCase()) ||
        lower.includes(b.name.toLowerCase()) ||
        (b.id === 'delhi-jal-board' && lower.includes('jal board')) ||
        (b.id === 'adani-elec-mum' && lower.includes('adani')) ||
        (b.id === 'tata-power-ddl' && lower.includes('tata')) ||
        (b.id === 'bescom-bengaluru' && lower.includes('bescom')) ||
        (b.id === 'bses-rajdhani' && lower.includes('bses'))
    );

    const numberMatch = clean.match(/\b([0-9]{7,12})\b/);
    const consumerCandidate = numberMatch ? numberMatch[1] : undefined;

    return {
      type: 'BILL',
      rawQuery: clean,
      category,
      billerId: matchedBiller?.id,
      consumerNumberCandidate: consumerCandidate,
      isHighValue,
      assistantResponse: matchedBiller
        ? `I can help you pay your ${matchedBiller.shortName} bill. Please select or confirm your consumer account details.`
        : `I can help you pay your ${category} bill. Here are the providers from our verified demo directory. Which one is yours?`,
    };
  }

  // 5. Explicit P2P send to specific UPI handle or name
  const isP2PSend =
    recipientUpi ||
    lower.startsWith('send ') ||
    lower.startsWith('transfer ') ||
    lower.includes(' to ') ||
    lower.includes('person');

  if (isP2PSend || recipientUpi) {
    const upi = recipientUpi || 'rahul.sharma@okhdfcbank';
    const resolved = resolveUpiRecipient(upi, amount || 500);

    return {
      type: 'P2P',
      rawQuery: clean,
      recipientUpi: upi,
      resolvedRecipient: resolved,
      amount: amount || 500,
      detectedScamKeywords,
      isHighValue,
      assistantResponse: `I've prepared a payment lookup for ${resolved.resolvedName}. Before continuing, let's complete a mandatory safety check.`,
    };
  }

  if (lower.includes('pay') || lower.includes('bill')) {
    return {
      type: 'BILL',
      rawQuery: clean,
      category: 'electricity',
      isHighValue,
      assistantResponse:
        "I'm ready to help with your bill. Which utility bill would you like to pay?",
    };
  }

  return {
    type: 'UNKNOWN',
    rawQuery: clean,
    assistantResponse:
      "I can show sample billers, contacts, merchants, or a new-recipient lookup. These checks use demo data only. What would you like to try?",
  };
}

