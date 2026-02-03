'use client';

import { useEffect, useState } from "react";
import {
  MOCK_DROPOFF_STAGES,
  MOCK_GROWTH_POINTS,
  MOCK_RETENTION_METRICS,
  MOCK_SPACED_REPETITION_METRICS,
} from "@/lib/mock-admin-analytics";
import { MOCK_EISENHOWER_TASKS } from "@/lib/mock-eisenhower";
import { CategoryIcon } from "@/components/icons";
import { TargetIcon } from "@/components/icons/dashboard";
import { MultiIconLoader } from "@/components/multi-icon-loader";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMAT.format(date);
}

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

function formatMinutes(value: number): string {
  if (value < 60) return `${value}m`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function WeeklyGrowthChart() {
  const points = MOCK_GROWTH_POINTS;
  if (points.length === 0) return null;

  const maxActive = Math.max(...points.map((point) => point.activeUsers));
  const maxNew = Math.max(...points.map((point) => point.newUsers));
  const maxValue = Math.max(maxActive, maxNew);

  const chartWidth = 100;
  const chartHeight = 40;
  const paddingX = 6;
  const paddingY = 6;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const xForIndex = (index: number) => {
    if (points.length === 1) return paddingX + innerWidth / 2;
    const ratio = index / (points.length - 1);
    return paddingX + ratio * innerWidth;
  };

  const yForValue = (value: number) => {
    if (maxValue === 0) return paddingY + innerHeight;
    const ratio = value / maxValue;
    return paddingY + innerHeight - ratio * innerHeight;
  };

  const activePolylinePoints = points
    .map((point, index) => `${xForIndex(index)},${yForValue(point.activeUsers)}`)
    .join(" ");

  const newPolylinePoints = points
    .map((point, index) => `${xForIndex(index)},${yForValue(point.newUsers)}`)
    .join(" ");

  return (
    <div className="mt-3 space-y-2">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-20 w-full text-emerald-500 dark:text-emerald-300"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="growth-active" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="growth-new" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Active users area */}
        <path
          d={`M ${paddingX},${paddingY + innerHeight} ` +
            activePolylinePoints +
            ` L ${paddingX + innerWidth},${paddingY + innerHeight} Z`}
          fill="url(#growth-active)"
        />

        {/* New users area */}
        <path
          d={`M ${paddingX},${paddingY + innerHeight} ` +
            newPolylinePoints +
            ` L ${paddingX + innerWidth},${paddingY + innerHeight} Z`}
          fill="url(#growth-new)"
        />

        {/* Active users line */}
        <polyline
          points={activePolylinePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />

        {/* New users line */}
        <polyline
          points={newPolylinePoints}
          fill="none"
          stroke="rgb(59,130,246)"
          strokeWidth={1.5}
        />
      </svg>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-300" />
            <span>Active users</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>New users</span>
          </span>
        </div>
        <span>
          {formatDate(points[0].date)} –{" "}
          {formatDate(points[points.length - 1].date)}
        </span>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const latest = MOCK_GROWTH_POINTS[MOCK_GROWTH_POINTS.length - 1];
  const tasksByCategory = {
    highPriority: MOCK_EISENHOWER_TASKS.filter(
      (task) => task.category === "highPriority",
    ),
    spacedRepetition: MOCK_EISENHOWER_TASKS.filter(
      (task) => task.category === "spacedRepetition",
    ),
    backlog: MOCK_EISENHOWER_TASKS.filter(
      (task) => task.category === "backlog",
    ),
    easyFavorite: MOCK_EISENHOWER_TASKS.filter(
      (task) => task.category === "easyFavorite",
    ),
  };
  const eisenhowerSections = [
    {
      key: "highPriority",
      title: "High priority task",
      description: "Urgent focus items needing immediate attention.",
    },
    {
      key: "spacedRepetition",
      title: "Spaced repetition task",
      description: "Cadence-driven reviews to keep memory fresh.",
    },
    {
      key: "backlog",
      title: "Backlog",
      description: "Deprioritized work queued for later cycles.",
    },
    {
      key: "easyFavorite",
      title: "Easy and favorite",
      description: "Quick wins and user-favorite routines.",
    },
  ] as const;

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <MultiIconLoader
        title="Loading admin analytics"
        subtitle="Crunching growth, retention, and funnel metrics."
        size="lg"
        icons={[
          { node: <TargetIcon />, label: "Growth" },
          { node: <CategoryIcon category="Study" />, label: "Insights" },
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Admin Analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Early product–market fit signals across growth, retention, and
            drop-off points.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Active users (latest day)
            </h2>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(latest.activeUsers)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(latest.date)}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              New users (latest day)
            </h2>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(latest.newUsers)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Signups attributed to last 24 hours.
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Weekly growth (visual)
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Active vs new users over the last week.
            </p>
            <WeeklyGrowthChart />
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Retention cohorts
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Day 1 / Day 7 / Day 30 retention by signup cohort.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full border-separate border-spacing-0 text-left text-xs">
                <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Cohort</th>
                    <th className="px-3 py-2">Day 1</th>
                    <th className="px-3 py-2">Day 7</th>
                    <th className="px-3 py-2">Day 30</th>
                    <th className="px-3 py-2">Consistency</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RETENTION_METRICS.map((cohort, index) => (
                    <tr
                      key={cohort.cohortLabel}
                      className={[
                        "text-xs",
                        index % 2 === 1
                          ? "bg-zinc-50/60 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {cohort.cohortLabel}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {cohort.day1Retention}%
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {cohort.day7Retention}%
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {cohort.day30Retention}%
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {cohort.focusConsistencyScore}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Drop-off funnel
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Onboarding → first focus → payment → first fine.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {MOCK_DROPOFF_STAGES.map((stage) => (
                <li
                  key={stage.stage}
                  className="flex items-start justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {stage.stage}
                    </p>
                    {stage.notes ? (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {stage.notes}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-300">
                    {stage.dropOffRate.toFixed(1)}%
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Spaced repetition adherence
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Learners following 3, 7, and 21-day cadences.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full border-separate border-spacing-0 text-left text-xs">
                <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Cadence</th>
                    <th className="px-3 py-2">Active learners</th>
                    <th className="px-3 py-2">Completion rate</th>
                    <th className="px-3 py-2">Trophy</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SPACED_REPETITION_METRICS.map((metric, index) => (
                    <tr
                      key={metric.cadenceDays}
                      className={[
                        "text-xs",
                        index % 2 === 1
                          ? "bg-zinc-50/60 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                        Every {metric.cadenceDays} days
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {formatNumber(metric.activeLearners)}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {metric.completionRate}%
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          <span aria-hidden="true">🏆</span>
                          <span>{metric.trophyLabel}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Spaced repetition trophy
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Visible reward for consistent learners.
            </p>
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-200">
              <div className="text-4xl">🏆</div>
              <p className="mt-2 text-sm font-semibold">
                Spaced repetition trophy
              </p>
              <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-200/80">
                Awarded when learners complete cadence milestones (3/7/21 days).
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {eisenhowerSections.map((section) => {
            const tasks = tasksByCategory[section.key];
            return (
              <div
                key={section.key}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
              >
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {section.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {section.description}
                </p>
                {tasks.length === 0 ? (
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    No tasks in this quadrant right now.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-200">
                    {tasks.map((task) => {
                      const remaining = Math.max(
                        task.targetMinutes - task.todayMinutes,
                        0,
                      );
                      const timeSummary = `${formatMinutes(
                        task.todayMinutes,
                      )} / ${formatMinutes(task.targetMinutes)}`;
                      const remainingSummary =
                        remaining === 0
                          ? "Target met"
                          : `${formatMinutes(remaining)} left`;

                      return (
                        <li
                          key={task.id}
                          className="flex flex-col gap-1 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {task.owner}
                                {task.dueNote ? ` • ${task.dueNote}` : ""}
                              </p>
                            </div>
                            <span
                              className={[
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                                task.status === "success"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {task.status === "success"
                                ? "Successful session"
                                : "Failed session"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>Today: {timeSummary}</span>
                            <span>•</span>
                            <span>{remainingSummary}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}


