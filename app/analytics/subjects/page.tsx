'use client';

import {
  MOCK_EISENHOWER_DISTRIBUTION,
  MOCK_SCHEDULING_METRICS,
  MOCK_SUBJECTS,
} from "@/lib/mock-subjects";
import {
  CategoryIcon,
  CompletionRateIcon,
  ScheduledSessionsIcon,
  TotalSubjectsIcon,
} from "@/components/icons";

const categoryOrder = ["Study", "Work", "Fitness", "Personal", "Other"];

export default function SubjectInsightsPage() {
  const totalSubjects = MOCK_SUBJECTS.length;

  if (totalSubjects === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
        <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Subject &amp; Scheduling Insights
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Understand how users plan, categorise, and follow through on their
              focus work.
            </p>
          </div>
        </header>

        <main className="mx-auto flex max-w-6xl items-center justify-center">
          <section className="max-w-xl rounded-2xl bg-white p-6 text-sm shadow-sm ring-1 ring-dashed ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              No subjects configured yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Once users start adding subjects in the app, this page will show
              how they&apos;re organising their work and how well they follow
              their plans.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-500 dark:text-zinc-400">
              <li>Subject categories (study, work, fitness, personal, etc.).</li>
              <li>Eisenhower matrix breakdown by urgency and importance.</li>
              <li>
                Scheduling success: how many scheduled blocks users actually
                complete.
              </li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              For now you can keep an eye on early users in the admin Users view
              and come back here once the first study plans are live.
            </p>
          </section>
        </main>
      </div>
    );
  }

  const categoryCounts = categoryOrder.map((category) => ({
    category,
    count: MOCK_SUBJECTS.filter(
      (subject) => subject.category === category || subject.category === category,
    ).length,
  }));

  const completionRate =
    MOCK_SCHEDULING_METRICS.scheduledSessions > 0
      ? (MOCK_SCHEDULING_METRICS.completedScheduledSessions /
          MOCK_SCHEDULING_METRICS.scheduledSessions) *
        100
      : 0;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Subject &amp; Scheduling Insights
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Understand how users plan, categorise, and follow through on their
            focus work.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
              >
                <TotalSubjectsIcon />
              </span>
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Total subjects
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {totalSubjects.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Unique subjects users have created.
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
              >
                <ScheduledSessionsIcon />
              </span>
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Scheduled sessions
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {MOCK_SCHEDULING_METRICS.scheduledSessions.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Sessions users have explicitly scheduled.
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <CompletionRateIcon />
              </span>
              <h2 className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                Scheduled completion
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {completionRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Scheduled vs completed sessions.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Subject categories
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Most common subject themes across the user base.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {categoryCounts.map((item) => (
                <li
                  key={item.category}
                  className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-600 shadow-sm dark:bg-zinc-950/60 dark:text-zinc-300"
                    >
                      <CategoryIcon category={item.category} />
                    </span>
                    <span>{item.category}</span>
                  </span>
                  <span className="font-medium">
                    {item.count}{" "}
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      subjects
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Eisenhower matrix distribution
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              How users are classifying their work into urgency and importance
              quadrants.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              {MOCK_EISENHOWER_DISTRIBUTION.map((bucket) => (
                <div
                  key={bucket.quadrant}
                  className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {bucket.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {bucket.count}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    subjects
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>Recent subjects (read-only)</span>
            <span>{MOCK_SUBJECTS.length} examples</span>
          </div>
          <div className="max-h-[50vh] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Eisenhower quadrant</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBJECTS.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className={[
                      "text-sm",
                      index % 2 === 1
                        ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                      {subject.userId}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                      {subject.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        {
                          MOCK_EISENHOWER_DISTRIBUTION.find(
                            (item) => item.quadrant === subject.quadrant,
                          )?.label
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}


