export type GrowthPoint = {
  date: string;
  activeUsers: number;
  newUsers: number;
};

export type RetentionMetrics = {
  cohortLabel: string;
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  focusConsistencyScore: number;
};

export type DropOffStage = {
  stage: "Onboarding" | "First focus session" | "Payment" | "First fine";
  dropOffRate: number;
  notes?: string;
};

export type SpacedRepetitionMetric = {
  cadenceDays: 3 | 7 | 21;
  activeLearners: number;
  completionRate: number;
  trophyLabel: string;
};

export const MOCK_GROWTH_POINTS: GrowthPoint[] = [
  { date: "2025-12-31", activeUsers: 820, newUsers: 120 },
  { date: "2026-01-01", activeUsers: 910, newUsers: 150 },
  { date: "2026-01-02", activeUsers: 980, newUsers: 165 },
  { date: "2026-01-03", activeUsers: 1040, newUsers: 172 },
  { date: "2026-01-04", activeUsers: 1125, newUsers: 188 },
  { date: "2026-01-05", activeUsers: 1210, newUsers: 205 },
];

export const MOCK_RETENTION_METRICS: RetentionMetrics[] = [
  {
    cohortLabel: "Signups 7 days ago",
    day1Retention: 62,
    day7Retention: 34,
    day30Retention: 18,
    focusConsistencyScore: 78,
  },
  {
    cohortLabel: "Signups 14 days ago",
    day1Retention: 59,
    day7Retention: 31,
    day30Retention: 15,
    focusConsistencyScore: 74,
  },
];

export const MOCK_DROPOFF_STAGES: DropOffStage[] = [
  {
    stage: "Onboarding",
    dropOffRate: 18,
    notes: "Most users exit at subject creation step.",
  },
  {
    stage: "First focus session",
    dropOffRate: 11,
    notes: "Session timer feels too long for new users.",
  },
  {
    stage: "Payment",
    dropOffRate: 6,
    notes: "UPI flow interruptions and low balance.",
  },
  {
    stage: "First fine",
    dropOffRate: 4,
    notes: "Higher churn after first penalty; clarify appeal flow.",
  },
];

export const MOCK_SPACED_REPETITION_METRICS: SpacedRepetitionMetric[] = [
  {
    cadenceDays: 3,
    activeLearners: 412,
    completionRate: 72,
    trophyLabel: "3-day cadence trophy",
  },
  {
    cadenceDays: 7,
    activeLearners: 268,
    completionRate: 61,
    trophyLabel: "7-day cadence trophy",
  },
  {
    cadenceDays: 21,
    activeLearners: 146,
    completionRate: 48,
    trophyLabel: "21-day cadence trophy",
  },
];


