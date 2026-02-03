export type SessionStatus = "completed" | "failed" | "abandoned";

export type SessionEvent = {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  distanceEarnedKm: number;
};

export type DailySessionMetrics = {
  date: string;
  sessionsStarted: number;
  sessionsCompleted: number;
  sessionsFailedOrAbandoned: number;
  averageDurationMinutes: number;
};

export type PeakHourBucket = {
  hourLabel: string;
  sessions: number;
};

export const MOCK_DAILY_SESSION_METRICS: DailySessionMetrics[] = [
  {
    date: "2026-01-05",
    sessionsStarted: 4100,
    sessionsCompleted: 3842,
    sessionsFailedOrAbandoned: 258,
    averageDurationMinutes: 47,
  },
  {
    date: "2026-01-04",
    sessionsStarted: 3975,
    sessionsCompleted: 3650,
    sessionsFailedOrAbandoned: 325,
    averageDurationMinutes: 45,
  },
];

export const MOCK_PEAK_HOURS: PeakHourBucket[] = [
  { hourLabel: "06:00–09:00", sessions: 320 },
  { hourLabel: "09:00–12:00", sessions: 780 },
  { hourLabel: "12:00–15:00", sessions: 540 },
  { hourLabel: "15:00–18:00", sessions: 910 },
  { hourLabel: "18:00–21:00", sessions: 1020 },
  { hourLabel: "21:00–24:00", sessions: 620 },
];

export const MOCK_SESSION_EVENTS: SessionEvent[] = [
  {
    id: "sess_001",
    userId: "usr_01",
    startTime: "2026-01-05T07:10:00Z",
    endTime: "2026-01-05T07:55:00Z",
    status: "completed",
    distanceEarnedKm: 1.4,
  },
  {
    id: "sess_002",
    userId: "usr_02",
    startTime: "2026-01-05T09:30:00Z",
    endTime: "2026-01-05T09:50:00Z",
    status: "failed",
    distanceEarnedKm: 0.4,
  },
  {
    id: "sess_003",
    userId: "usr_01",
    startTime: "2026-01-05T18:00:00Z",
    endTime: "2026-01-05T18:45:00Z",
    status: "completed",
    distanceEarnedKm: 1.2,
  },
  {
    id: "sess_004",
    userId: "usr_03",
    startTime: "2026-01-04T20:10:00Z",
    endTime: "2026-01-04T20:22:00Z",
    status: "abandoned",
    distanceEarnedKm: 0.1,
  },
];


