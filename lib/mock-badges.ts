export type BadgeType = "Focused" | "Streak Master" | "Early Bird" | "Night Owl";

export type BadgeSummary = {
  type: BadgeType;
  count: number;
};

export type UserBadgeEvent = {
  id: string;
  userId: string;
  type: BadgeType;
  earnedAt: string;
  reason: string;
};

export const MOCK_BADGE_SUMMARY: BadgeSummary[] = [
  { type: "Focused", count: 820 },
  { type: "Streak Master", count: 210 },
  { type: "Early Bird", count: 145 },
  { type: "Night Owl", count: 98 },
];

export const MOCK_USER_BADGE_EVENTS: UserBadgeEvent[] = [
  {
    id: "badge_evt_001",
    userId: "usr_01",
    type: "Focused",
    earnedAt: "2026-01-04T07:15:00Z",
    reason: "Completed 10 focus sessions in a week.",
  },
  {
    id: "badge_evt_002",
    userId: "usr_01",
    type: "Streak Master",
    earnedAt: "2026-01-05T06:50:00Z",
    reason: "Maintained a 30-day streak.",
  },
  {
    id: "badge_evt_003",
    userId: "usr_02",
    type: "Night Owl",
    earnedAt: "2025-12-29T23:30:00Z",
    reason: "Completed 5 sessions after 11pm.",
  },
];


