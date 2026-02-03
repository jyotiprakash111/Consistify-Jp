'use client';

import { useMemo, useState } from "react";
import {
  MOCK_PARTNER_MATCHES,
  PartnerMatch,
  PartnerMatchStatus,
} from "@/lib/mock-partner-matches";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMAT.format(date);
}

type StatusFilter = "all" | PartnerMatchStatus;

export default function MatchesPage() {
  const [matches, setMatches] = useState<PartnerMatch[]>(MOCK_PARTNER_MATCHES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [minOverall, setMinOverall] = useState("60");
  const [minTarget, setMinTarget] = useState("60");
  const [minStreak, setMinStreak] = useState("60");

  const filteredMatches = useMemo(() => {
    const overallThreshold = Number.parseFloat(minOverall);
    const targetThreshold = Number.parseFloat(minTarget);
    const streakThreshold = Number.parseFloat(minStreak);

    return matches.filter((match) => {
      if (statusFilter !== "all" && match.status !== statusFilter) {
        return false;
      }
      if (Number.isFinite(overallThreshold) && match.overallScore < overallThreshold) {
        return false;
      }
      if (Number.isFinite(targetThreshold) && match.targetScore < targetThreshold) {
        return false;
      }
      if (Number.isFinite(streakThreshold) && match.streakScore < streakThreshold) {
        return false;
      }
      return true;
    });
  }, [matches, statusFilter, minOverall, minTarget, minStreak]);

  function updateStatus(id: string, nextStatus: PartnerMatchStatus) {
    setMatches((previous) =>
      previous.map((match) =>
        match.id === id ? { ...match, status: nextStatus } : match,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Partner matching oversight
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review queued partner matches and approve or reject pairings.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {filteredMatches.length} matches in view •{" "}
          {matches.filter((match) => match.status === "pending").length} pending
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-4">
        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 md:grid-cols-5">
          <div className="md:col-span-1">
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Status
            </label>
            <select
              id="status-filter"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="min-overall"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Min overall
            </label>
            <input
              id="min-overall"
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={minOverall}
              onChange={(event) => setMinOverall(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="min-target"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Min target score
            </label>
            <input
              id="min-target"
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={minTarget}
              onChange={(event) => setMinTarget(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="min-streak"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Min streak score
            </label>
            <input
              id="min-streak"
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={minStreak}
              onChange={(event) => setMinStreak(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setMinOverall("60");
                setMinTarget("60");
                setMinStreak("60");
                setStatusFilter("pending");
              }}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Reset filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>Pending match queue</span>
            <span>{filteredMatches.length} matches</span>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Match ID</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Target score</th>
                  <th className="px-4 py-3">Streak score</th>
                  <th className="px-4 py-3">Overall</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      No matches meet the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((match, index) => (
                    <tr
                      key={match.id}
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
                        {match.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col text-xs text-zinc-700 dark:text-zinc-200">
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {match.userAName} ↔ {match.userBName}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {match.userAId} • {match.userBId}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {match.targetScore}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {match.streakScore}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                        {match.overallScore}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(match.requestedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            match.status === "approved" &&
                              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                            match.status === "rejected" &&
                              "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                            match.status === "pending" &&
                              "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {match.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-xs">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => updateStatus(match.id, "approved")}
                            disabled={match.status === "approved"}
                            className="rounded-md border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(match.id, "rejected")}
                            disabled={match.status === "rejected"}
                            className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/40"
                          >
                            Reject
                          </button>
                        </div>
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
