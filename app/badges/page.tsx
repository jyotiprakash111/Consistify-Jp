'use client';

import { useState } from "react";
import {
  MOCK_BADGE_SUMMARY,
  MOCK_USER_BADGE_EVENTS,
  BadgeType,
  UserBadgeEvent,
} from "@/lib/mock-badges";
import { BadgeIcon } from "@/components/icons";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMAT.format(date);
}

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

type ManualBadgeCorrection = {
  id: string;
  userId: string;
  type: BadgeType;
  note: string;
  createdAt: string;
};

const badgeColors: Record<BadgeType, string> = {
  Focused:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Streak Master":
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  "Early Bird":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Night Owl":
    "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
};

export default function BadgesPage() {
  const [corrections, setCorrections] = useState<ManualBadgeCorrection[]>([]);
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<BadgeType>("Focused");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const totalBadges = MOCK_BADGE_SUMMARY.reduce(
    (sum, badge) => sum + badge.count,
    0,
  );

  function handleCorrectionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!userId.trim()) {
      setMessage("User ID is required for badge correction.");
      return;
    }
    if (!note.trim()) {
      setMessage("Please provide a short admin note.");
      return;
    }

    const correction: ManualBadgeCorrection = {
      id: `corr_${corrections.length + 1}`,
      userId: userId.trim(),
      type,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    setCorrections((previous) => [correction, ...previous]);
    setUserId("");
    setNote("");
    setMessage("Badge correction recorded locally (log-only for now).");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Badge &amp; Progress Monitoring
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ensure gamification logic is behaving as expected across users.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        {message ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
              >
                <BadgeIcon />
              </span>
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Total badges earned
              </h2>
            </div>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(totalBadges)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Across all users and badge types.
            </p>
          </article>

          {MOCK_BADGE_SUMMARY.slice(0, 2).map((badge) => (
            <article
              key={badge.type}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <BadgeIcon />
                </span>
                <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {badge.type}
                </h2>
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatNumber(badge.count)}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Badges of this type earned so far.
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Badge distribution
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Relative share of each badge type.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {MOCK_BADGE_SUMMARY.map((badge) => (
                <li
                  key={badge.type}
                  className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        badgeColors[badge.type],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {badge.type}
                    </span>
                  </span>
                  <span className="font-medium">
                    {badge.count}{" "}
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      earned
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Manual badge correction
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              For correcting edge cases or bugs. This only logs corrections in
              the admin UI for now.
            </p>
            <form className="mt-3 space-y-3" onSubmit={handleCorrectionSubmit}>
              <div>
                <label
                  htmlFor="badge-user-id"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  User ID
                </label>
                <input
                  id="badge-user-id"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="badge-type"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Badge
                </label>
                <select
                  id="badge-type"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={type}
                  onChange={(event) => setType(event.target.value as BadgeType)}
                >
                  {Object.keys(badgeColors).map((badgeType) => (
                    <option key={badgeType} value={badgeType}>
                      {badgeType}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="badge-note"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Admin note (why adjusting?)
                </label>
                <textarea
                  id="badge-note"
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Log badge correction
              </button>
            </form>

            {corrections.length > 0 ? (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Recent corrections
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {corrections.map((correction) => (
                    <li key={correction.id} className="flex flex-col">
                      <span>
                        {correction.userId} • {correction.type} •{" "}
                        {correction.note}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatDateTime(correction.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>User-level badge history</span>
            <span>{MOCK_USER_BADGE_EVENTS.length} recent events</span>
          </div>
          <div className="max-h-[50vh] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Earned at</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USER_BADGE_EVENTS.map((event, index) => (
                  <tr
                    key={event.id}
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
                      {event.userId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          badgeColors[event.type],
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {event.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                      {event.reason}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                      {formatDateTime(event.earnedAt)}
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


