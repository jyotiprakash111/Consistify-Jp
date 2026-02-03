export type TransactionStatus = "success" | "failed" | "pending";

export type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  method: "UPI";
  razorpayPaymentId: string;
  status: TransactionStatus;
  createdAt: string;
  attempts: number;
  refunds: number;
};

export type WalletOverview = {
  totalDeposits: number;
  totalActiveBalances: number;
};

export const MOCK_WALLET_OVERVIEW: WalletOverview = {
  totalDeposits: 52340.75,
  totalActiveBalances: 41320.5,
};

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "txn_001",
    userId: "usr_01",
    amount: 25,
    method: "UPI",
    razorpayPaymentId: "pay_ABC123",
    status: "success",
    createdAt: "2026-01-05T07:32:00Z",
    attempts: 1,
    refunds: 0,
  },
  {
    id: "txn_001b",
    userId: "usr_01",
    amount: 25,
    method: "UPI",
    razorpayPaymentId: "pay_ABC124",
    status: "success",
    createdAt: "2026-01-05T07:36:00Z",
    attempts: 1,
    refunds: 0,
  },
  {
    id: "txn_001c",
    userId: "usr_01",
    amount: 25,
    method: "UPI",
    razorpayPaymentId: "pay_ABC125",
    status: "success",
    createdAt: "2026-01-05T07:39:00Z",
    attempts: 1,
    refunds: 0,
  },
  {
    id: "txn_002",
    userId: "usr_02",
    amount: 10,
    method: "UPI",
    razorpayPaymentId: "pay_DEF456",
    status: "failed",
    createdAt: "2026-01-05T08:15:00Z",
    attempts: 3,
    refunds: 0,
  },
  {
    id: "txn_002b",
    userId: "usr_02",
    amount: -20,
    method: "UPI",
    razorpayPaymentId: "payout_DEF457",
    status: "success",
    createdAt: "2026-01-05T08:22:00Z",
    attempts: 1,
    refunds: 0,
  },
  {
    id: "txn_002c",
    userId: "usr_02",
    amount: -15,
    method: "UPI",
    razorpayPaymentId: "payout_DEF458",
    status: "success",
    createdAt: "2026-01-05T08:27:00Z",
    attempts: 1,
    refunds: 0,
  },
  {
    id: "txn_003",
    userId: "usr_03",
    amount: 50,
    method: "UPI",
    razorpayPaymentId: "pay_GHI789",
    status: "pending",
    createdAt: "2026-01-05T09:45:00Z",
    attempts: 2,
    refunds: 0,
  },
  {
    id: "txn_004",
    userId: "usr_04",
    amount: 15,
    method: "UPI",
    razorpayPaymentId: "pay_JKL012",
    status: "success",
    createdAt: "2026-01-04T19:20:00Z",
    attempts: 1,
    refunds: 2,
  },
];

export function hasFraudFlags(transaction: WalletTransaction): boolean {
  return transaction.attempts >= 3 || transaction.refunds >= 2;
}


