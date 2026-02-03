export type AnalyticsDeviceType = "ios" | "android" | "web";

export type AnalyticsEventName =
  | "user_registered"
  | "session_start"
  | "session_complete"
  | "session_fail"
  | "subject_created"
  | "schedule_generated"
  | "deposit_success"
  | "deposit_fail"
  | "avatar_change";

export type BaseAnalyticsEvent = {
  /**
   * Stable unique identifier for this event. Should be a UUID.
   */
  id: string;
  /**
   * The event name, used as the discriminator for the union type.
   */
  name: AnalyticsEventName;
  /**
   * User identifier from your auth system.
   */
  userId: string;
  /**
   * Device category, kept coarse for easier aggregation.
   */
  device: AnalyticsDeviceType;
  /**
   * App version string, e.g. "1.2.0".
   */
  appVersion: string;
  /**
   * ISO 8601 timestamp for when the event occurred, in UTC.
   */
  occurredAt: string;
  /**
   * Logical session identifier for the focus session, if applicable.
   */
  sessionId?: string;
  /**
   * Subject identifier, if the event is tied to a subject.
   */
  subjectId?: string;
  /**
   * Duration in seconds associated with the event, when relevant
   * (e.g. focus session duration).
   */
  durationSeconds?: number;
  /**
   * Snapshot of the user wallet balance (in rupees) at the moment the event
   * was generated. Useful for later audits and cohorting.
   */
  walletBalanceSnapshotInRupees?: number;
};

export type UserRegisteredEvent = BaseAnalyticsEvent & {
  name: "user_registered";
  properties: {
    signupSource?: string;
    referralCode?: string | null;
    marketingOptIn?: boolean;
  };
};

export type SessionStartEvent = BaseAnalyticsEvent & {
  name: "session_start";
  properties: {
    plannedDurationSeconds?: number;
    isScheduledSession?: boolean;
  };
};

export type SessionCompleteEvent = BaseAnalyticsEvent & {
  name: "session_complete";
  properties: {
    actualDurationSeconds: number;
    distanceEarnedKm: number;
    /**
     * For scheduled sessions, whether the session started within the
     * scheduled window.
     */
    onTimeStart?: boolean;
  };
};

export type SessionFailEvent = BaseAnalyticsEvent & {
  name: "session_fail";
  properties: {
    /**
     * High-level reason code, e.g. "phub_detection", "user_cancelled",
     * "app_crash", etc.
     */
    reason: string;
    distanceEarnedKm?: number;
  };
};

export type SubjectCreatedEvent = BaseAnalyticsEvent & {
  name: "subject_created";
  properties: {
    subjectId: string;
    title: string;
    category: string;
    eisenhowerQuadrant?: string;
  };
};

export type ScheduleGeneratedEvent = BaseAnalyticsEvent & {
  name: "schedule_generated";
  properties: {
    totalBlocks: number;
    daysCovered: number;
    /**
     * Number of subjects included in this schedule batch.
     */
    subjectsIncluded: number;
  };
};

export type DepositSuccessEvent = BaseAnalyticsEvent & {
  name: "deposit_success";
  properties: {
    amountInRupees: number;
    razorpayPaymentId: string;
    paymentMethod: string;
  };
};

export type DepositFailEvent = BaseAnalyticsEvent & {
  name: "deposit_fail";
  properties: {
    amountInRupees: number;
    razorpayPaymentId?: string;
    paymentMethod?: string;
    errorCode?: string;
    errorDescription?: string;
  };
};

export type AvatarChangeEvent = BaseAnalyticsEvent & {
  name: "avatar_change";
  properties: {
    previousAvatar?: string;
    newAvatar: string;
  };
};

export type AnalyticsEvent =
  | UserRegisteredEvent
  | SessionStartEvent
  | SessionCompleteEvent
  | SessionFailEvent
  | SubjectCreatedEvent
  | ScheduleGeneratedEvent
  | DepositSuccessEvent
  | DepositFailEvent
  | AvatarChangeEvent;

/**
 * Convenience helper to build a strongly-typed event for a given name.
 * This keeps event construction consistent from the mobile app, web app,
 * and backend.
 */
export function buildAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  base: Omit<BaseAnalyticsEvent, "name">,
  properties: Extract<AnalyticsEvent, { name: Name }>["properties"],
): Extract<AnalyticsEvent, { name: Name }> {
  return {
    ...base,
    name,
    properties,
  } as Extract<AnalyticsEvent, { name: Name }>;
}

/**
 * Default retention windows for raw events. These are used by helper
 * utilities and should be mirrored in your actual storage/ETL layer.
 */
export const DEFAULT_SESSION_EVENT_RETENTION_DAYS = 365; // 12 months
export const DEFAULT_PAYMENT_EVENT_RETENTION_DAYS = 365 * 3; // 3 years


