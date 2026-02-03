'use client';

import { useMemo, useState } from "react";
import {
  AdminOcrSubmission,
  AdminOcrStatus,
  MOCK_OCR_SUBMISSIONS,
} from "@/lib/mock-ocr-submissions";

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

type StatusFilter = "all" | AdminOcrStatus;

export default function OcrReviewPage() {
  const [submissions, setSubmissions] =
    useState<AdminOcrSubmission[]>(MOCK_OCR_SUBMISSIONS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [minAccuracy, setMinAccuracy] = useState("60");
  const [minQuestions, setMinQuestions] = useState("10");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctionQuestions, setCorrectionQuestions] = useState("");
  const [correctionAccuracy, setCorrectionAccuracy] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const orderedSubmissions = useMemo(
    () =>
      [...submissions].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime(),
      ),
    [submissions],
  );

  const filteredSubmissions = useMemo(() => {
    const accuracyThreshold = Number.parseFloat(minAccuracy);
    const questionsThreshold = Number.parseFloat(minQuestions);

    return orderedSubmissions.filter((submission) => {
      if (statusFilter !== "all" && submission.status !== statusFilter) {
        return false;
      }
      if (
        Number.isFinite(accuracyThreshold) &&
        submission.accuracyPercent < accuracyThreshold
      ) {
        return false;
      }
      if (
        Number.isFinite(questionsThreshold) &&
        submission.questionsSolved < questionsThreshold
      ) {
        return false;
      }
      return true;
    });
  }, [orderedSubmissions, statusFilter, minAccuracy, minQuestions]);

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.id === selectedId) ?? null,
    [submissions, selectedId],
  );

  function updateStatus(id: string, nextStatus: AdminOcrStatus) {
    setSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === id ? { ...submission, status: nextStatus } : submission,
      ),
    );
  }

  function handleApplyCorrection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!selectedSubmission) {
      setMessage("Select a submission to correct first.");
      return;
    }

    const parsedQuestions = correctionQuestions
      ? Number.parseInt(correctionQuestions, 10)
      : undefined;
    const parsedAccuracy = correctionAccuracy
      ? Number.parseFloat(correctionAccuracy)
      : undefined;

    if (
      parsedQuestions === undefined &&
      parsedAccuracy === undefined &&
      !correctionNote.trim()
    ) {
      setMessage("Enter at least one correction field.");
      return;
    }

    const accuracyForImpact =
      parsedAccuracy ?? selectedSubmission.accuracyPercent;
    const impactDays =
      accuracyForImpact >= 85 ? 1 : accuracyForImpact < 60 ? -1 : 0;

    setSubmissions((previous) =>
      previous.map((submission) => {
        if (submission.id !== selectedSubmission.id) return submission;
        return {
          ...submission,
          status: "review",
          manualCorrection: {
            questionsSolved: parsedQuestions ?? submission.questionsSolved,
            accuracyPercent: parsedAccuracy ?? submission.accuracyPercent,
            note: correctionNote.trim() || "Manual correction applied.",
            correctedBy: "admin@consistify.ai",
            correctedAt: new Date().toISOString(),
          },
          streakImpactPreview: {
            daysDelta: impactDays,
            reason:
              impactDays === 1
                ? "Correction keeps streak active."
                : impactDays === -1
                  ? "Correction triggers streak break."
                  : "Correction requires final approval.",
          },
        };
      }),
    );

    setCorrectionQuestions("");
    setCorrectionAccuracy("");
    setCorrectionNote("");
    setMessage(`Correction applied to ${selectedSubmission.id}.`);
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            OCR / Progress Review
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review recent screenshot uploads, AI-extracted progress, and streak
            impact before approval.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {filteredSubmissions.length} uploads in view
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-4">
        {message ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 md:grid-cols-4">
          <div>
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
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="fined">Fined</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="min-accuracy"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Min accuracy %
            </label>
            <input
              id="min-accuracy"
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={minAccuracy}
              onChange={(event) => setMinAccuracy(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="min-questions"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Min questions solved
            </label>
            <input
              id="min-questions"
              type="number"
              min={0}
              max={200}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={minQuestions}
              onChange={(event) => setMinQuestions(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pending");
                setMinAccuracy("60");
                setMinQuestions("10");
              }}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Reset filters
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span>Recent uploads</span>
              <span>{filteredSubmissions.length} entries</span>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Submission</th>
                    <th className="px-4 py-3">AI extracted</th>
                    <th className="px-4 py-3">Manual correction</th>
                    <th className="px-4 py-3">Streak impact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400"
                      >
                        No uploads meet the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission, index) => (
                      <tr
                        key={submission.id}
                        className={[
                          "text-sm",
                          index % 2 === 1
                            ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedId(submission.id)}
                            className="flex flex-col text-left text-xs text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-zinc-50"
                          >
                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                              {submission.screenshotLabel}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {submission.userId} • {formatDateTime(submission.submittedAt)}
                            </span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-700 dark:text-zinc-200">
                          {submission.questionsSolved} / {submission.questionCount} questions
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {submission.accuracyPercent}% accuracy
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-200">
                          {submission.manualCorrection ? (
                            <div>
                              <p>
                                {submission.manualCorrection.questionsSolved ??
                                  submission.questionsSolved}{" "}
                                questions •{" "}
                                {submission.manualCorrection.accuracyPercent ??
                                  submission.accuracyPercent}
                                % accuracy
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {submission.manualCorrection.note}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-200">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                              submission.streakImpactPreview.daysDelta > 0 &&
                                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                              submission.streakImpactPreview.daysDelta < 0 &&
                                "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                              submission.streakImpactPreview.daysDelta === 0 &&
                                "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {submission.streakImpactPreview.daysDelta > 0
                              ? `+${submission.streakImpactPreview.daysDelta} day`
                              : submission.streakImpactPreview.daysDelta < 0
                                ? `${submission.streakImpactPreview.daysDelta} day`
                                : "No change"}
                          </span>
                          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {submission.streakImpactPreview.reason}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                              submission.status === "approved" &&
                                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                              (submission.status === "fined" ||
                                submission.status === "rejected") &&
                                "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                              submission.status === "review" &&
                                "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                              submission.status === "pending" &&
                                "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {submission.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(submission.id, "approved")}
                              className="rounded-md border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(submission.id, "fined")}
                              className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/40"
                            >
                              Fine
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Manual correction
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Adjust AI-extracted values and preview streak impact before final
              approval.
            </p>
            <div className="rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {selectedSubmission
                ? `Selected: ${selectedSubmission.id} (${selectedSubmission.userId})`
                : "Select a submission from the table to edit."}
            </div>
            <form className="space-y-3" onSubmit={handleApplyCorrection}>
              <div>
                <label
                  htmlFor="correction-questions"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Corrected questions solved
                </label>
                <input
                  id="correction-questions"
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={correctionQuestions}
                  onChange={(event) => setCorrectionQuestions(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="correction-accuracy"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Corrected accuracy %
                </label>
                <input
                  id="correction-accuracy"
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={correctionAccuracy}
                  onChange={(event) => setCorrectionAccuracy(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="correction-note"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Note
                </label>
                <textarea
                  id="correction-note"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  placeholder="What changed and why?"
                  value={correctionNote}
                  onChange={(event) => setCorrectionNote(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Apply correction
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
}
