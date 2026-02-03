export type SubjectCategory =
  | "Study"
  | "Work"
  | "Fitness"
  | "Personal"
  | "Other";

export type SubjectSummary = {
  id: string;
  userId: string;
  name: string;
  category: SubjectCategory;
  quadrant: "UI" | "UNI" | "NUI" | "NUNI";
};

export type EisenhowerDistribution = {
  quadrant: "UI" | "UNI" | "NUI" | "NUNI";
  label: string;
  count: number;
};

export type SchedulingMetrics = {
  scheduledSessions: number;
  completedScheduledSessions: number;
};

export const MOCK_SUBJECTS: SubjectSummary[] = [
  {
    id: "sub_001",
    userId: "usr_01",
    name: "Deep work – product design",
    category: "Work",
    quadrant: "UI",
  },
  {
    id: "sub_002",
    userId: "usr_01",
    name: "Exam prep – calculus",
    category: "Study",
    quadrant: "UI",
  },
  {
    id: "sub_003",
    userId: "usr_02",
    name: "Daily run",
    category: "Fitness",
    quadrant: "UNI",
  },
  {
    id: "sub_004",
    userId: "usr_03",
    name: "Inbox zero",
    category: "Work",
    quadrant: "NUI",
  },
  {
    id: "sub_005",
    userId: "usr_04",
    name: "Scroll social media",
    category: "Other",
    quadrant: "NUNI",
  },
];

export const MOCK_EISENHOWER_DISTRIBUTION: EisenhowerDistribution[] = [
  { quadrant: "UI", label: "Urgent & Important", count: 42 },
  { quadrant: "UNI", label: "Important, Not Urgent", count: 68 },
  { quadrant: "NUI", label: "Urgent, Not Important", count: 21 },
  { quadrant: "NUNI", label: "Not Urgent, Not Important", count: 9 },
];

export const MOCK_SCHEDULING_METRICS: SchedulingMetrics = {
  scheduledSessions: 3200,
  completedScheduledSessions: 2620,
};


