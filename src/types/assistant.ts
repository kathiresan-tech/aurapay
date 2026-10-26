export type BillerCategory = 'electricity' | 'water' | 'gas' | 'broadband' | 'mobile_postpaid';

export interface SampleConsumer {
  label: string;
  consumerNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  dueInDays: number;
  billPeriod: string;
  units?: string;
  breakdown: {
    baseCharges: number;
    fixedCharges: number;
    taxes: number;
    earlyPaymentDiscount: number;
  };
}

export interface Biller {
  id: string;
  name: string;
  shortName: string;
  category: BillerCategory;
  state: string;
  logoIcon: string;
  accentColor: string;
  consumerLabel: string;
  consumerPlaceholder: string;
  consumerHelpText: string;
  bbpsId: string;
  verifiedStatus: 'BBPS_VERIFIED';
  sampleAccounts: SampleConsumer[];
}

export interface BillDetails {
  billerId: string;
  billerName: string;
  category: BillerCategory;
  consumerNumber: string;
  customerName: string;
  billAmount: number;
  dueDate: string;
  dueInDays: number;
  billPeriod: string;
  billDate: string;
  billNumber: string;
  units?: string;
  breakdown: {
    baseCharges: number;
    fixedCharges: number;
    taxes: number;
    earlyPaymentDiscount: number;
  };
  bbpsRefId: string;
}

export type PaymentPurpose =
  | 'family_friends'
  | 'goods_services'
  | 'online_marketplace'
  | 'job_registration'
  | 'prize_lottery'
  | 'refund_deposit'
  | 'other';

export interface P2PRecipient {
  upiId: string;
  resolvedName: string;
  bankName: string;
  accountMatched: boolean;
  matchType: 'ACCOUNT_NAME_MATCHED_ONLY'; // explicitly NOT verified safe!
  suggestedAmount?: number;
  isCommonScamTarget?: boolean;
  isFriendContact?: boolean;
  friendVerification?: FriendVerificationInfo;
  isMerchant?: boolean;
  merchantVerification?: MerchantVerificationInfo;
}

export interface FriendVerificationInfo {
  isVerifiedUser: boolean;
  statusBadge: string;
  kycCompleted: boolean;
  aadhaarLinked: boolean;
  accountAgeMonths: number;
  explanation: string;
}

export interface FriendContact {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  bankName: string;
  avatarColor: string;
  isVerifiedUser: boolean;
  verificationBadge: string;
  kycCompleted: boolean;
  aadhaarLinked: boolean;
  accountAgeMonths: number;
  relationship: string;
  explanation: string;
  recentTxCount: number;
  suggestedAmount?: number;
}

export interface MerchantVerificationInfo {
  isVerifiedMerchant: boolean;
  businessName: string;
  tradeName: string;
  category: string;
  isGstRegistered: boolean;
  gstin?: string;
  mccCode: string;
  disputeRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  physicalAddress: string;
  verifiedBadgeText: string;
  explanation: string;
  warningFlags?: string[];
}

export interface MerchantEntity {
  id: string;
  businessName: string;
  tradeName: string;
  upiId: string;
  category: string;
  iconName: string;
  verification: MerchantVerificationInfo;
  defaultAmount?: number;
}

export interface FirstPaymentSafetyCheck {
  purpose: PaymentPurpose | null;
  isPressured: boolean | null;
  scamRiskScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  acknowledgedWarning: boolean;
}

export type AssistantStep =
  | 'home'
  | 'biller_selection'
  | 'consumer_input'
  | 'bill_review'
  | 'friend_select'
  | 'merchant_select'
  | 'new_user_input'
  | 'p2p_safety_check'
  | 'pre_auth_review'
  | 'two_step_verification'
  | 'device_verification'
  | 'qr_scanner'
  | 'receipt';

export interface TransactionRecord {
  id: string;
  date: string;
  /** Unix epoch ms — used for duplicate-payment detection */
  timestamp?: number;
  type: 'BILL' | 'P2P' | 'MERCHANT';
  title: string;
  subtitle: string;
  amount: number;
  billerOrRecipient: string;
  accountReference: string;
  status: 'COMPLETED' | 'CANCELLED';
  utrNumber: string;
  paymentMethod: string;
  warningNote?: string;
  verificationTag?: string;
  twoFactorVerified?: boolean;
}
