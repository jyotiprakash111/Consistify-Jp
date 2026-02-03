export type SystemConfig = {
  wallet: {
    enabled: boolean;
    depositAmountInRupees: number;
    sessionFailureFine: number;
    phubFine: number;
  };

  sessions: {
    maintenanceMode: boolean;
    maxSessionMinutes: number;
    phubTiltAngle: number;
    phubTimeoutSeconds: number;
  };

  gamification: {
    badgesEnabled: boolean;
    coinsEnabled: boolean;
    sprintModeEnabled: boolean;
  };

  avatar: {
    slowOnTilt: boolean;
    fallOnTimeout: boolean;
    celebrationEnabled: boolean;
  };

  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
  };

  payment: {
    provider: string;
    mode: "test" | "live";
    currency: string;
    minDepositInRupees: number;
    maxDepositInRupees: number;
    upiEnabled: boolean;
    cardsEnabled: boolean;
  };
};

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  wallet: {
    enabled: true,
    depositAmountInRupees: 200,
    sessionFailureFine: 20,
    phubFine: 20,
  },
  sessions: {
    maintenanceMode: false,
    maxSessionMinutes: 120,
    phubTiltAngle: 45,
    phubTimeoutSeconds: 30,
  },
  gamification: {
    badgesEnabled: true,
    coinsEnabled: true,
    sprintModeEnabled: true,
  },
  avatar: {
    slowOnTilt: true,
    fallOnTimeout: true,
    celebrationEnabled: true,
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
  },
  payment: {
    provider: "Razorpay",
    mode: "test",
    currency: "INR",
    minDepositInRupees: 200,
    maxDepositInRupees: 2000,
    upiEnabled: true,
    cardsEnabled: true,
  },
};

export type FeatureFlags = {
  walletEnforcementEnabled: boolean;
  badgeRewardsEnabled: boolean;
  maintenanceModeEnabled: boolean;
  depositAmountInRupees: number;
  coinsEnabled: boolean;
  sprintModeEnabled: boolean;
  avatarCelebrationEnabled: boolean;
   emailNotificationsEnabled: boolean;
   pushNotificationsEnabled: boolean;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  walletEnforcementEnabled: DEFAULT_SYSTEM_CONFIG.wallet.enabled,
  badgeRewardsEnabled: DEFAULT_SYSTEM_CONFIG.gamification.badgesEnabled,
  maintenanceModeEnabled: DEFAULT_SYSTEM_CONFIG.sessions.maintenanceMode,
  depositAmountInRupees: DEFAULT_SYSTEM_CONFIG.wallet.depositAmountInRupees,
  coinsEnabled: DEFAULT_SYSTEM_CONFIG.gamification.coinsEnabled,
  sprintModeEnabled: DEFAULT_SYSTEM_CONFIG.gamification.sprintModeEnabled,
  avatarCelebrationEnabled: DEFAULT_SYSTEM_CONFIG.avatar.celebrationEnabled,
  emailNotificationsEnabled: DEFAULT_SYSTEM_CONFIG.notifications.emailEnabled,
  pushNotificationsEnabled: DEFAULT_SYSTEM_CONFIG.notifications.pushEnabled,
};
