export type ApiErrorLog = {
  id: string;
  endpoint: string;
  statusCode: number;
  message: string;
  createdAt: string;
};

export type PaymentFailureLog = {
  id: string;
  userId: string;
  amount: number;
  razorpayPaymentId: string;
  reason: string;
  createdAt: string;
};

export type SessionCrashLog = {
  id: string;
  userId: string;
  platform: "android" | "ios" | "web";
  context: string;
  createdAt: string;
};

export type AdminActionLog = {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  createdAt: string;
};

export const MOCK_API_ERROR_LOGS: ApiErrorLog[] = [
  {
    id: "api_err_001",
    endpoint: "POST /api/sessions/start",
    statusCode: 500,
    message: "Unexpected error starting session timer.",
    createdAt: "2026-01-05T07:05:00Z",
  },
  {
    id: "api_err_002",
    endpoint: "GET /api/users/me",
    statusCode: 401,
    message: "Invalid auth token.",
    createdAt: "2026-01-04T21:10:00Z",
  },
];

export const MOCK_PAYMENT_FAILURE_LOGS: PaymentFailureLog[] = [
  {
    id: "pay_fail_001",
    userId: "usr_02",
    amount: 200,
    razorpayPaymentId: "pay_DEF456",
    reason: "UPI app closed before completion.",
    createdAt: "2026-01-05T08:15:00Z",
  },
];

export const MOCK_SESSION_CRASH_LOGS: SessionCrashLog[] = [
  {
    id: "crash_001",
    userId: "usr_03",
    platform: "android",
    context: "App backgrounded during running session; process killed.",
    createdAt: "2026-01-04T20:22:00Z",
  },
];

export const MOCK_ADMIN_ACTION_LOGS: AdminActionLog[] = [
  {
    id: "admin_act_001",
    adminEmail: "admin@example.com",
    action: "Disabled user",
    target: "usr_03",
    createdAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "admin_act_002",
    adminEmail: "admin@example.com",
    action: "Manual wallet credit",
    target: "usr_01 (₹50)",
    createdAt: "2026-01-05T09:05:00Z",
  },
];


