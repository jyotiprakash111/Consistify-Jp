import {
  AnalyticsEvent,
  AnalyticsEventName,
  DepositSuccessEvent,
  SessionStartEvent,
  SessionCompleteEvent,
  UserRegisteredEvent,
} from "./analytics-events";

export type PercentageMetric = {
  numerator: number;
  denominator: number;
  percentage: number;
};

function toDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function byName<Name extends AnalyticsEventName>(
  events: AnalyticsEvent[],
  name: Name,
): Extract<AnalyticsEvent, { name: Name }>[] {
  return events.filter(
    (event): event is Extract<AnalyticsEvent, { name: Name }> =>
      event.name === name,
  );
}

/**
 * Percentage of newly registered users who complete at least one focus session
 * within 24 hours of registration.
 */
export function getFirstDaySessionCompletionRate(
  events: AnalyticsEvent[],
): PercentageMetric {
  const signups = byName("user_registered", events);
  if (signups.length === 0) {
    return { numerator: 0, denominator: 0, percentage: 0 };
  }

  const sessionEvents = events.filter(
    (event) => event.name === "session_complete" || event.name === "session_start",
  ) as (SessionCompleteEvent | SessionStartEvent)[];

  let numerator = 0;

  signups.forEach((signup) => {
    const signupAt = toDate(signup.occurredAt).getTime();
    const cutoff = signupAt + 24 * 60 * 60 * 1000;

    const hasSessionWithin24h = sessionEvents.some(
      (session) =>
        session.userId === signup.userId &&
        signupAt <= toDate(session.occurredAt).getTime() &&
        toDate(session.occurredAt).getTime() <= cutoff,
    );

    if (hasSessionWithin24h) {
      numerator += 1;
    }
  });

  const denominator = signups.length;
  const percentage =
    denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(2));

  return { numerator, denominator, percentage };
}

/**
 * Simple D1 / D7 retention based on "had any focus session".
 *
 * For each newly registered user, we look for at least one session_start
 * event whose occurredAt falls within the [day, day+1) window after signup.
 */
export function getSessionRetentionRate(
  events: AnalyticsEvent[],
  options: { day: 1 | 7 },
): PercentageMetric {
  const { day } = options;

  const signups = byName("user_registered", events);
  if (signups.length === 0) {
    return { numerator: 0, denominator: 0, percentage: 0 };
  }

  const sessionStarts = byName("session_start", events);
  let retainedUsers = 0;

  signups.forEach((signup) => {
    const signupAt = toDate(signup.occurredAt).getTime();
    const windowStart = signupAt + day * 24 * 60 * 60 * 1000;
    const windowEnd = windowStart + 24 * 60 * 60 * 1000;

    const hasSessionInWindow = sessionStarts.some((session) => {
      if (session.userId !== signup.userId) return false;
      const t = toDate(session.occurredAt).getTime();
      return t >= windowStart && t < windowEnd;
    });

    if (hasSessionInWindow) {
      retainedUsers += 1;
    }
  });

  const denominator = signups.length;
  const percentage =
    denominator === 0
      ? 0
      : Number(((retainedUsers / denominator) * 100).toFixed(2));

  return { numerator: retainedUsers, denominator, percentage };
}

/**
 * Funnel:
 *  - onboarded: user_registered
 *  - deposited: at least one deposit_success
 *  - first_session: at least one session_start
 */
export function getOnboardDepositSessionFunnel(
  events: AnalyticsEvent[],
): {
  onboarded: PercentageMetric;
  deposited: PercentageMetric;
  firstSession: PercentageMetric;
} {
  const signups = byName("user_registered", events);
  const deposits = byName("deposit_success", events);
  const sessionStarts = byName("session_start", events);

  const totalOnboarded = signups.length;
  const usersWithDeposit = new Set<string>();
  const usersWithSession = new Set<string>();

  deposits.forEach((event: DepositSuccessEvent) => {
    usersWithDeposit.add(event.userId);
  });

  sessionStarts.forEach((event: SessionStartEvent) => {
    usersWithSession.add(event.userId);
  });

  let onboardedAndDeposited = 0;
  let onboardedDepositedAndSession = 0;

  signups.forEach((signup: UserRegisteredEvent) => {
    const hasDeposit = usersWithDeposit.has(signup.userId);
    const hasSession = usersWithSession.has(signup.userId);

    if (hasDeposit) onboardedAndDeposited += 1;
    if (hasDeposit && hasSession) onboardedDepositedAndSession += 1;
  });

  const onboardedMetric: PercentageMetric = {
    numerator: totalOnboarded,
    denominator: totalOnboarded,
    percentage: 100,
  };

  const depositedMetric: PercentageMetric = {
    numerator: onboardedAndDeposited,
    denominator: totalOnboarded,
    percentage:
      totalOnboarded === 0
        ? 0
        : Number(((onboardedAndDeposited / totalOnboarded) * 100).toFixed(2)),
  };

  const firstSessionMetric: PercentageMetric = {
    numerator: onboardedDepositedAndSession,
    denominator: totalOnboarded,
    percentage:
      totalOnboarded === 0
        ? 0
        : Number(
            ((onboardedDepositedAndSession / totalOnboarded) * 100).toFixed(2),
          ),
  };

  return {
    onboarded: onboardedMetric,
    deposited: depositedMetric,
    firstSession: firstSessionMetric,
  };
}

/**
 * Utility to export raw analytics events as CSV so they can be pulled into
 * spreadsheets or a warehouse for deeper analysis.
 */
export function exportEventsToCsv(events: AnalyticsEvent[]): string {
  const header = [
    "event_id",
    "name",
    "user_id",
    "device",
    "app_version",
    "occurred_at",
    "session_id",
    "subject_id",
    "duration_seconds",
    "wallet_balance_snapshot_in_rupees",
    "properties_json",
  ];

  const rows = events.map((event) => [
    event.id,
    event.name,
    event.userId,
    event.device,
    event.appVersion,
    event.occurredAt,
    event.sessionId ?? "",
    event.subjectId ?? "",
    event.durationSeconds?.toString() ?? "",
    event.walletBalanceSnapshotInRupees?.toString() ?? "",
    JSON.stringify((event as any).properties ?? {}),
  ]);

  return [header, ...rows]
    .map((row) =>
      row
        .map((cell) =>
          `"${String(cell).replace(/"/g, '""')}"`,
        )
        .join(","),
    )
    .join("\n");
}


