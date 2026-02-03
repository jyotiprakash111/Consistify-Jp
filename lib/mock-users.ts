export type AdminUserGender = "male" | "female" | "other";

export type AdminUser = {
  id: string;
  phone: string;
  email: string;
  gender: AdminUserGender;
  avatar: string;
  subscriptionTier: "normal" | "premium";
  registeredAt: string;
  walletBalance: number;
  refundEligibleAmount: number;
  totalFineCollected: number;
  currentStreakDays: number;
  partnerMatchCount: number;
  complianceRate: number;
  lastActiveAt: string;
  isActive: boolean;
  isDisabled: boolean;
  signupSource: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  lastDeviceType: "ios" | "android" | "web";
  lastAppVersion: string;
  lastLocation: string;
  tags: string[];
};

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr_01",
    phone: "+1 555-0100",
    email: "focus.fox@example.com",
    gender: "female",
    avatar: "Focus Fox",
    subscriptionTier: "premium",
    registeredAt: "2024-09-12T10:30:00Z",
    walletBalance: 25.5,
    refundEligibleAmount: 18.0,
    totalFineCollected: 6.5,
    currentStreakDays: 14,
    partnerMatchCount: 6,
    complianceRate: 0.92,
    lastActiveAt: "2026-01-05T08:10:00Z",
    isActive: true,
    isDisabled: false,
    signupSource: "Mobile app • Organic",
    phoneVerified: true,
    emailVerified: true,
    lastDeviceType: "ios",
    lastAppVersion: "1.4.2",
    lastLocation: "San Francisco, US",
    tags: ["VIP", "Beta tester"],
  },
  {
    id: "usr_02",
    phone: "+1 555-0101",
    email: "deep.panda@example.com",
    gender: "male",
    avatar: "Deep Panda",
    subscriptionTier: "normal",
    registeredAt: "2024-10-01T16:00:00Z",
    walletBalance: 2.75,
    refundEligibleAmount: 1.5,
    totalFineCollected: 3.0,
    currentStreakDays: 0,
    partnerMatchCount: 1,
    complianceRate: 0.68,
    lastActiveAt: "2025-12-30T19:45:00Z",
    isActive: false,
    isDisabled: false,
    signupSource: "Web • Referral",
    phoneVerified: true,
    emailVerified: false,
    lastDeviceType: "web",
    lastAppVersion: "1.3.0",
    lastLocation: "London, UK",
    tags: ["Churn risk"],
  },
  {
    id: "usr_03",
    phone: "+44 7700 900123",
    email: "sprint.otter@example.com",
    gender: "other",
    avatar: "Sprint Otter",
    subscriptionTier: "premium",
    registeredAt: "2024-11-21T09:15:00Z",
    walletBalance: 0.0,
    refundEligibleAmount: 0.0,
    totalFineCollected: 12.0,
    currentStreakDays: 3,
    partnerMatchCount: 2,
    complianceRate: 0.74,
    lastActiveAt: "2026-01-04T21:03:00Z",
    isActive: true,
    isDisabled: true,
    signupSource: "Mobile app • Campaign: FOCUS50",
    phoneVerified: true,
    emailVerified: true,
    lastDeviceType: "android",
    lastAppVersion: "1.4.0",
    lastLocation: "Berlin, DE",
    tags: ["Refund sensitive"],
  },
  {
    id: "usr_04",
    phone: "+91 98765 43210",
    email: "calm.koala@example.com",
    gender: "female",
    avatar: "Calm Koala",
    subscriptionTier: "premium",
    registeredAt: "2025-01-03T12:05:00Z",
    walletBalance: 120.0,
    refundEligibleAmount: 92.5,
    totalFineCollected: 4.0,
    currentStreakDays: 32,
    partnerMatchCount: 11,
    complianceRate: 0.97,
    lastActiveAt: "2026-01-05T06:42:00Z",
    isActive: true,
    isDisabled: false,
    signupSource: "Mobile app • Invite",
    phoneVerified: true,
    emailVerified: true,
    lastDeviceType: "ios",
    lastAppVersion: "1.5.0",
    lastLocation: "Bangalore, IN",
    tags: ["High value"],
  },
];

export function findAdminUserById(id: string): AdminUser | undefined {
  return MOCK_ADMIN_USERS.find((user) => user.id === id);
}


