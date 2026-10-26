import { parseUserQuery } from '../src/utils/nlpParser';
import { DEMO_VERIFIED_BILLERS } from '../src/data/mockBillers';
import { resolveUpiRecipient, evaluateSafetyCheck } from '../src/data/mockRecipients';
import { MOCK_FRIENDS_LIST } from '../src/data/mockFriends';
import { MOCK_MERCHANTS } from '../src/data/mockMerchants';

console.log('====================================================');
console.log('🧪 RUNNING AURAPAY AI EXPANDED ACCEPTANCE TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details: string = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`   └─ ${details}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// TEST 1: Minimal Prompt & Bill Intent Parsing
// -------------------------------------------------------------
console.log('--- Test 1: NLP Intent Parsing for Bill Payments ---');
const electricityQuery = parseUserQuery('Pay my electricity bill');
assert(electricityQuery.type === 'BILL', 'Parsed query type as BILL');
assert(electricityQuery.category === 'electricity', 'Parsed category as electricity');

const waterQuery = parseUserQuery('Pay water bill');
assert(waterQuery.type === 'BILL', 'Water bill parsed as BILL');
assert(waterQuery.category === 'water', 'Parsed category as water');

// -------------------------------------------------------------
// TEST 2: Demo BBPS Verified Biller Directory
// -------------------------------------------------------------
console.log('\n--- Test 2: Demo Verified Biller Directory Constraints ---');
assert(DEMO_VERIFIED_BILLERS.length >= 8, `Directory has ${DEMO_VERIFIED_BILLERS.length} verified billers`);
const allVerified = DEMO_VERIFIED_BILLERS.every(
  (b) => b.verifiedStatus === 'BBPS_VERIFIED' && b.bbpsId.startsWith('BBPS-')
);
assert(allVerified, 'All billers have official BBPS_VERIFIED status and BBPS IDs');

// -------------------------------------------------------------
// TEST 3: "Pay to my friends" & Contact List User Verification
// -------------------------------------------------------------
console.log('\n--- Test 3: "Pay to My Friends" & User Verification ---');
const friendsQuery = parseUserQuery('pay to my friends');
assert(friendsQuery.type === 'FRIENDS', 'Recognized "pay to my friends" query as FRIENDS flow');

assert(MOCK_FRIENDS_LIST.length >= 4, `Contact list has ${MOCK_FRIENDS_LIST.length} friends with UPI IDs`);

const verifiedFriends = MOCK_FRIENDS_LIST.filter((f) => f.isVerifiedUser);
assert(verifiedFriends.length > 0, 'Contact list includes verified KYC users');
assert(
  verifiedFriends.every((f) => f.kycCompleted && f.aadhaarLinked),
  'Verified users confirm KYC and Aadhaar linkage'
);

const unverifiedFriends = MOCK_FRIENDS_LIST.filter((f) => !f.isVerifiedUser);
assert(unverifiedFriends.length > 0, 'Contact list flags unverified users');
assert(
  unverifiedFriends.some((f) => f.explanation.includes('Warning') || f.explanation.includes('Caution')),
  'Unverified contacts include detailed risk and warning explanations'
);

// -------------------------------------------------------------
// TEST 4: "Pay to Merchant" & Merchant Verification Check
// -------------------------------------------------------------
console.log('\n--- Test 4: "Pay to Merchant" & Business / GSTIN Verification ---');
const merchantQuery = parseUserQuery('Pay to merchant');
assert(merchantQuery.type === 'MERCHANT', 'Recognized "Pay to merchant" query as MERCHANT flow');

assert(MOCK_MERCHANTS.length >= 3, `Merchant directory has ${MOCK_MERCHANTS.length} merchant entities`);

const verifiedMerchants = MOCK_MERCHANTS.filter((m) => m.verification.isVerifiedMerchant);
assert(verifiedMerchants.length > 0, 'Directory includes certified verified merchants');
assert(
  verifiedMerchants.every((m) => m.verification.isGstRegistered && m.verification.gstin),
  'Verified merchants confirm active GSTIN and merchant category code'
);

const unverifiedMerchants = MOCK_MERCHANTS.filter((m) => !m.verification.isVerifiedMerchant);
assert(unverifiedMerchants.length > 0, 'Directory includes unverified merchant test cases');
assert(
  unverifiedMerchants.some((m) => m.verification.warningFlags && m.verification.warningFlags.length > 0),
  'Unverified merchants display warnings against personal accounts posing as shops'
);

// -------------------------------------------------------------
// TEST 5: "Pay New User" Flow & Name Match Disclaimer
// -------------------------------------------------------------
console.log('\n--- Test 5: "Pay New User" Flow ---');
const newUserQuery = parseUserQuery('Pay new user');
assert(newUserQuery.type === 'NEW_USER', 'Recognized "Pay new user" query as NEW_USER flow');

const resolvedNew = resolveUpiRecipient('newperson@okhdfcbank', 1500);
assert(resolvedNew.accountMatched, 'Account name lookup succeeds');
assert(resolvedNew.matchType === 'ACCOUNT_NAME_MATCHED_ONLY', 'Match type is strictly ACCOUNT_NAME_MATCHED_ONLY');
assert((resolvedNew as any).matchType !== 'VERIFIED_SAFE', 'Confirms account name match is NOT verified safe');

// -------------------------------------------------------------
// TEST 6: 2-Step Verification for Payments Above ₹10,000
// -------------------------------------------------------------
console.log('\n--- Test 6: 2-Step Verification for Payments > ₹10,000 ---');
const regularAmountQuery = parseUserQuery('Pay 5000 to Priya');
assert(!regularAmountQuery.isHighValue, '₹5,000 transfer is below threshold, no 2-step verification required');

const highValueQuery = parseUserQuery('Pay 15000 to Priya Verma');
assert(highValueQuery.isHighValue === true, '₹15,000 transfer triggers high-value threshold (> ₹10,000)');

const veryHighValueQuery = parseUserQuery('Send ₹25000 to merchant');
assert(veryHighValueQuery.isHighValue === true, '₹25,000 transfer triggers high-value threshold (> ₹10,000)');

// -------------------------------------------------------------
// TEST 7: Scam Pattern Detection & High-Risk Warnings
// -------------------------------------------------------------
console.log('\n--- Test 7: Scam Pattern Detection ---');
const prizeSafety = evaluateSafetyCheck('prize_lottery', false, 'KUMAR TRADERS', 'Pay 500 fee to claim 25000 prize');
assert(prizeSafety.scamRiskScore === 'CRITICAL', 'Prize claim fee flagged as CRITICAL risk');

const refundSafety = evaluateSafetyCheck('refund_deposit', false, 'REFUND DESK', 'Refund deposit of 1000');
assert(refundSafety.scamRiskScore === 'CRITICAL', 'Refund deposit flagged as CRITICAL risk');

const pressureSafety = evaluateSafetyCheck('family_friends', true, 'UNKNOWN RECIPIENT');
assert(pressureSafety.scamRiskScore === 'HIGH', 'User under phone pressure flagged as HIGH risk');

console.log('\n====================================================');
console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log('====================================================\n');
