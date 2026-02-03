export type PartnerMatchStatus = "pending" | "approved" | "rejected";

export type PartnerMatch = {
  id: string;
  userAId: string;
  userAName: string;
  userBId: string;
  userBName: string;
  targetScore: number;
  streakScore: number;
  overallScore: number;
  requestedAt: string;
  status: PartnerMatchStatus;
};

export const MOCK_PARTNER_MATCHES: PartnerMatch[] = [
  {
    id: "match_001",
    userAId: "usr_01",
    userAName: "Focus Fox",
    userBId: "usr_04",
    userBName: "Calm Koala",
    targetScore: 92,
    streakScore: 88,
    overallScore: 90,
    requestedAt: "2026-01-05T06:45:00Z",
    status: "pending",
  },
  {
    id: "match_002",
    userAId: "usr_02",
    userAName: "Deep Panda",
    userBId: "usr_03",
    userBName: "Sprint Otter",
    targetScore: 64,
    streakScore: 71,
    overallScore: 68,
    requestedAt: "2026-01-05T08:10:00Z",
    status: "pending",
  },
  {
    id: "match_003",
    userAId: "usr_03",
    userAName: "Sprint Otter",
    userBId: "usr_01",
    userBName: "Focus Fox",
    targetScore: 78,
    streakScore: 61,
    overallScore: 70,
    requestedAt: "2026-01-04T19:05:00Z",
    status: "approved",
  },
  {
    id: "match_004",
    userAId: "usr_04",
    userAName: "Calm Koala",
    userBId: "usr_02",
    userBName: "Deep Panda",
    targetScore: 52,
    streakScore: 48,
    overallScore: 50,
    requestedAt: "2026-01-04T18:40:00Z",
    status: "rejected",
  },
  {
    id: "match_005",
    userAId: "usr_01",
    userAName: "Focus Fox",
    userBId: "usr_03",
    userBName: "Sprint Otter",
    targetScore: 86,
    streakScore: 82,
    overallScore: 84,
    requestedAt: "2026-01-03T09:15:00Z",
    status: "pending",
  },
];
