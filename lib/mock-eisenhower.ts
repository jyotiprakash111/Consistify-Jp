export type EisenhowerCategory =
  | "highPriority"
  | "spacedRepetition"
  | "backlog"
  | "easyFavorite";

export type EisenhowerTask = {
  id: string;
  title: string;
  category: EisenhowerCategory;
  status: "success" | "failed";
  todayMinutes: number;
  targetMinutes: number;
  owner: string;
  dueNote?: string;
};

export const MOCK_EISENHOWER_TASKS: EisenhowerTask[] = [
  {
    id: "task_001",
    title: "Calculus practice set",
    category: "highPriority",
    status: "success",
    todayMinutes: 75,
    targetMinutes: 60,
    owner: "Focus Fox",
    dueNote: "Exam in 2 days",
  },
  {
    id: "task_002",
    title: "Physics spaced repetition",
    category: "spacedRepetition",
    status: "failed",
    todayMinutes: 20,
    targetMinutes: 45,
    owner: "Sprint Otter",
    dueNote: "3-day cadence",
  },
  {
    id: "task_003",
    title: "History revision backlog",
    category: "backlog",
    status: "failed",
    todayMinutes: 0,
    targetMinutes: 30,
    owner: "Deep Panda",
  },
  {
    id: "task_004",
    title: "Quick vocab warm-up",
    category: "easyFavorite",
    status: "success",
    todayMinutes: 15,
    targetMinutes: 15,
    owner: "Calm Koala",
    dueNote: "Favorite routine",
  },
  {
    id: "task_005",
    title: "Chemistry numericals",
    category: "highPriority",
    status: "failed",
    todayMinutes: 30,
    targetMinutes: 60,
    owner: "Focus Fox",
    dueNote: "Retake tomorrow",
  },
  {
    id: "task_006",
    title: "Language flashcards",
    category: "spacedRepetition",
    status: "success",
    todayMinutes: 40,
    targetMinutes: 40,
    owner: "Sprint Otter",
    dueNote: "7-day cadence",
  },
];
