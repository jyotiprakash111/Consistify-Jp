'use client';
 
import {
  MOCK_DAILY_SESSION_METRICS,
  MOCK_PEAK_HOURS,
  MOCK_SESSION_EVENTS,
} from "@/lib/mock-sessions";
import {
  AvgDurationIcon,
  SessionsCompletedIcon,
  SessionsFailedIcon,
  SessionsStartedIcon,
} from "@/components/icons";
 
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMAT.format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMAT.format(date);
}

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}
 
function exportCsv() {
  const header = [
    "Session ID",
    "User ID",
    "Start time",
    "End time",
    "Status",
    "Distance earned (km)",
  ];

  const rows = MOCK_SESSION_EVENTS.map((session) => [
    session.id,
    session.userId,
    formatDateTime(session.startTime),
    formatDateTime(session.endTime),
    session.status,
    session.distanceEarnedKm.toString(),
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sessions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function exportPdf() {
  if (typeof window === "undefined") return;

  const rows = MOCK_SESSION_EVENTS.map((session) => {
    return `
      <tr>
        <td>${session.id}</td>
        <td>${session.userId}</td>
        <td>${formatDateTime(session.startTime)}</td>
        <td>${formatDateTime(session.endTime)}</td>
        <td>${session.status}</td>
        <td>${session.distanceEarnedKm.toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Consistify – Session export</title>
    <style>
      * { box-sizing: border-box; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
      body { padding: 16px; font-size: 12px; color: #020617; }
      h1 { font-size: 16px; margin-bottom: 4px; }
      p { margin: 0 0 12px; color: #6b7280; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #e5e7eb; padding: 4px 6px; text-align: left; }
      th { background-color: #f9fafb; font-weight: 600; font-size: 11px; }
      td { font-size: 11px; }
      @page { size: A4 landscape; margin: 12mm; }
    </style>
  </head>
  <body>
    <h1>Consistify – Session & Focus Analytics</h1>
    <p>User-level session drill-down export</p>
    <table>
      <thead>
        <tr>
          <th>Session ID</th>
          <th>User ID</th>
          <th>Start time</th>
          <th>End time</th>
          <th>Status</th>
          <th>Distance (km)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function SessionsAnalyticsPage() {
  if (MOCK_DAILY_SESSION_METRICS.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
        <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Session &amp; Focus Analytics
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Validate product usage and accountability across all focus
              sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Export CSV
          </button>
        </header>

        <main className="mx-auto flex max-w-6xl items-center justify-center">
          <section className="max-w-xl rounded-2xl bg-white p-6 text-sm shadow-sm ring-1 ring-dashed ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              No focus sessions yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              This is normal for day zero. Once the first users start a focus
              session in the app, this page will light up with real data.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-500 dark:text-zinc-400">
              <li>Daily counts of sessions started, completed, and failed.</li>
              <li>Peak focus hours across the user base.</li>
              <li>Per-user session timelines with distance and outcomes.</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Start by running a few test sessions on the mobile app and then
              refresh this view to validate that tracking and aggregation work
              end to end.
            </p>
          </section>
        </main>
      </div>
    );
  }

  const latestDaily = MOCK_DAILY_SESSION_METRICS[0];

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Session &amp; Focus Analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Validate product usage and accountability across all focus sessions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Export PDF
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
              >
                <SessionsStartedIcon />
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                Sessions started
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(latestDaily.sessionsStarted)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(latestDaily.date)}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <SessionsCompletedIcon />
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                Sessions completed
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(latestDaily.sessionsCompleted)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Completion rate:{" "}
              {Math.round(
                (latestDaily.sessionsCompleted / latestDaily.sessionsStarted) *
                  100,
              )}
              %
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-700 shadow-sm dark:bg-red-950/40 dark:text-red-300"
              >
                <SessionsFailedIcon />
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-200">
                Failed / abandoned
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(latestDaily.sessionsFailedOrAbandoned)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {(
                (latestDaily.sessionsFailedOrAbandoned /
                  latestDaily.sessionsStarted) *
                100
              ).toFixed(1)}
              % of started
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
              >
                <AvgDurationIcon />
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                Avg. session duration
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {latestDaily.averageDurationMinutes} min
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Rolling daily average
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Peak focus hours
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Distribution of sessions started by time-of-day bucket.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs sm:grid-cols-4 md:grid-cols-3">
              {MOCK_PEAK_HOURS.map((bucket) => (
                <div
                  key={bucket.hourLabel}
                  className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 shadow-sm shadow-zinc-300 dark:shadow-zinc-200"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {bucket.hourLabel}
                  </p>
                  <p className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatNumber(bucket.sessions)}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    sessions started
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Daily session trend
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Started vs completed vs failed over recent days.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              {MOCK_DAILY_SESSION_METRICS.slice(0, 5).map((day) => {
                const total =
                  day.sessionsStarted || 1; // avoid divide-by-zero in UI
                const completedWidth =
                  (day.sessionsCompleted / total) * 100 || 0;
                const failedWidth =
                  (day.sessionsFailedOrAbandoned / total) * 100 || 0;
                const startedRemainder =
                  100 - completedWidth - failedWidth > 0
                    ? 100 - completedWidth - failedWidth
                    : 0;

                return (
                  <div
                    key={day.date}
                    className="flex items-center gap-3"
                  >
                    <div className="w-20 shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <div
                          className="h-full bg-emerald-400 dark:bg-emerald-500"
                          style={{ width: `${completedWidth}%` }}
                        />
                        <div
                          className="h-full bg-rose-400 dark:bg-rose-500"
                          style={{ width: `${failedWidth}%` }}
                        />
                        <div
                          className="h-full bg-zinc-200 dark:bg-zinc-700"
                          style={{ width: `${startedRemainder}%` }}
                        />
                      </div>
                      <div className="flex gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>
                          Started:{" "}
                          <span className="font-medium text-zinc-700 dark:text-zinc-200">
                            {formatNumber(day.sessionsStarted)}
                          </span>
                        </span>
                        <span>
                          Completed:{" "}
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            {formatNumber(day.sessionsCompleted)}
                          </span>
                        </span>
                        <span>
                          Failed:{" "}
                          <span className="font-medium text-rose-700 dark:text-rose-300">
                            {formatNumber(day.sessionsFailedOrAbandoned)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-300" />
                <span>Completed</span>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-300">
                <span className="h-2 w-2 rounded-full bg-rose-400 dark:bg-rose-300" />
                <span>Failed / abandoned</span>
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <span>Started (other)</span>
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>User-level session drill-down</span>
            <span>{MOCK_SESSION_EVENTS.length} recent sessions</span>
          </div>
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Start time</th>
                  <th className="px-4 py-3">End time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Distance earned</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SESSION_EVENTS.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      No individual sessions recorded yet. Once users complete
                      focus sessions, they will appear here with full details.
                    </td>
                  </tr>
                ) : (
                  MOCK_SESSION_EVENTS.map((session, index) => (
                    <tr
                      key={session.id}
                      className={[
                        "text-sm",
                        index % 2 === 1
                          ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                        {session.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                        {session.userId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                        {formatDateTime(session.startTime)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                        {formatDateTime(session.endTime)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            session.status === "completed" &&
                              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                            session.status !== "completed" &&
                              "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                        {session.distanceEarnedKm.toFixed(2)} km
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}


