export type AdminOcrAccuracyFlag = "pass" | "review" | "fail";
export type AdminOcrStatus = "pending" | "approved" | "review" | "fined" | "rejected";
export type AdminOcrAnalysisResult =
  | "clean"
  | "blurry"
  | "mismatch"
  | "suspicious";

export type AdminOcrSubmission = {
  id: string;
  userId: string;
  submittedAt: string;
  screenshotLabel: string;
  analysisResult: AdminOcrAnalysisResult;
  questionCount: number;
  questionsSolved: number;
  accuracyPercent: number;
  accuracyFlag: AdminOcrAccuracyFlag;
  status: AdminOcrStatus;
  manualCorrection?: {
    questionsSolved?: number;
    accuracyPercent?: number;
    note?: string;
    correctedBy?: string;
    correctedAt?: string;
  };
  streakImpactPreview: {
    daysDelta: number;
    reason: string;
  };
};

export const MOCK_OCR_SUBMISSIONS: AdminOcrSubmission[] = [
  {
    id: "ocr_1001",
    userId: "usr_01",
    submittedAt: "2026-01-05T07:58:00Z",
    screenshotLabel: "Session 219 • iOS",
    analysisResult: "clean",
    questionCount: 18,
    questionsSolved: 17,
    accuracyPercent: 94,
    accuracyFlag: "pass",
    status: "approved",
    streakImpactPreview: {
      daysDelta: 1,
      reason: "Clean pass keeps streak active.",
    },
  },
  {
    id: "ocr_1002",
    userId: "usr_01",
    submittedAt: "2026-01-04T19:12:00Z",
    screenshotLabel: "Session 218 • iOS",
    analysisResult: "blurry",
    questionCount: 14,
    questionsSolved: 12,
    accuracyPercent: 82,
    accuracyFlag: "review",
    status: "review",
    manualCorrection: {
      questionsSolved: 13,
      accuracyPercent: 88,
      note: "Adjusted after manual review of blurred entries.",
      correctedBy: "admin@consistify.ai",
      correctedAt: "2026-01-04T19:40:00Z",
    },
    streakImpactPreview: {
      daysDelta: 0,
      reason: "Manual review required before streak impact.",
    },
  },
  {
    id: "ocr_2001",
    userId: "usr_02",
    submittedAt: "2026-01-03T11:40:00Z",
    screenshotLabel: "Session 143 • Web",
    analysisResult: "mismatch",
    questionCount: 9,
    questionsSolved: 6,
    accuracyPercent: 58,
    accuracyFlag: "fail",
    status: "pending",
    streakImpactPreview: {
      daysDelta: -1,
      reason: "Below accuracy threshold may break streak.",
    },
  },
  {
    id: "ocr_3001",
    userId: "usr_03",
    submittedAt: "2026-01-04T20:55:00Z",
    screenshotLabel: "Session 87 • Android",
    analysisResult: "suspicious",
    questionCount: 11,
    questionsSolved: 9,
    accuracyPercent: 76,
    accuracyFlag: "review",
    status: "pending",
    streakImpactPreview: {
      daysDelta: 0,
      reason: "Awaiting manual review for streak decision.",
    },
  },
  {
    id: "ocr_4001",
    userId: "usr_04",
    submittedAt: "2026-01-05T06:25:00Z",
    screenshotLabel: "Session 305 • iOS",
    analysisResult: "clean",
    questionCount: 22,
    questionsSolved: 21,
    accuracyPercent: 95,
    accuracyFlag: "pass",
    status: "approved",
    streakImpactPreview: {
      daysDelta: 1,
      reason: "Clean pass keeps streak active.",
    },
  },
  {
    id: "ocr_4002",
    userId: "usr_04",
    submittedAt: "2026-01-04T07:14:00Z",
    screenshotLabel: "Session 304 • iOS",
    analysisResult: "blurry",
    questionCount: 16,
    questionsSolved: 14,
    accuracyPercent: 78,
    accuracyFlag: "review",
    status: "review",
    streakImpactPreview: {
      daysDelta: 0,
      reason: "Pending review before streak impact.",
    },
  },
];
