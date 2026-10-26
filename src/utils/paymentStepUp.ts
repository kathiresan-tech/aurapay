import type { TransactionRecord } from '../types/assistant';

export const PAYMENT_STEP_UP_THRESHOLD = 10_000;
export const PAYMENT_STEP_UP_WINDOW_MS = 20 * 60 * 60 * 1000;

export interface PaymentStepUpCheck {
  requiresTwoStep: boolean;
  rollingCount: number;
  sameAmountCount: number;
  previousTotal: number;
  totalIfPaid: number;
  reasons: string[];
}

function matchesRecipient(tx: TransactionRecord, target: string): boolean {
  const ref = tx.accountReference.trim().toLowerCase();
  const subtitle = tx.subtitle.trim().toLowerCase();
  return ref === target || subtitle === target || (target.length >= 5 && (ref.includes(target) || subtitle.includes(target)));
}

export function assessPaymentStepUp(
  transactions: TransactionRecord[],
  recipientReference: string,
  amount: number,
  now = Date.now(),
): PaymentStepUpCheck {
  const target = recipientReference.trim().toLowerCase();
  const recent = target ? transactions.filter((tx) => {
    if (tx.status !== 'COMPLETED') return false;
    const timestamp = tx.timestamp ?? Date.parse(tx.date);
    return Number.isFinite(timestamp)
      && timestamp <= now
      && now - timestamp < PAYMENT_STEP_UP_WINDOW_MS
      && matchesRecipient(tx, target);
  }) : [];

  const previousTotal = recent.reduce((sum, tx) => sum + tx.amount, 0);
  const totalIfPaid = previousTotal + amount;
  const rollingCount = recent.length + 1;
  const sameAmountCount = recent.filter((tx) => Math.abs(tx.amount - amount) < 0.01).length + 1;
  const reasons: string[] = [];

  if (amount >= PAYMENT_STEP_UP_THRESHOLD) reasons.push('This single payment is ₹10,000 or more.');
  if (amount < PAYMENT_STEP_UP_THRESHOLD && totalIfPaid >= PAYMENT_STEP_UP_THRESHOLD) {
    reasons.push(`Payments to this recipient would total ₹${totalIfPaid.toLocaleString('en-IN')} within 20 hours.`);
  }
  if (rollingCount >= 3) reasons.push(`${rollingCount} payments to this recipient would occur within 20 hours.`);
  if (sameAmountCount >= 3) reasons.push(`The same amount would be sent ${sameAmountCount} times within 20 hours.`);

  return {
    requiresTwoStep: amount >= PAYMENT_STEP_UP_THRESHOLD || totalIfPaid >= PAYMENT_STEP_UP_THRESHOLD || rollingCount >= 3,
    rollingCount,
    sameAmountCount,
    previousTotal,
    totalIfPaid,
    reasons,
  };
}
