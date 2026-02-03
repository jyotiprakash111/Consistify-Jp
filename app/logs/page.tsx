'use client';

import {
  MOCK_ADMIN_ACTION_LOGS,
  MOCK_API_ERROR_LOGS,
  MOCK_PAYMENT_FAILURE_LOGS,
  MOCK_SESSION_CRASH_LOGS,
} from "@/lib/mock-logs";
import { AlertIcon, ClockIcon } from "@/components/icons/dashboard";
import { WalletIcon as WalletLogIcon } from "@/components/icons/wallet";

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

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Logs &amp; Monitoring
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Lightweight view into key errors, failures, and admin actions over
            the last 24–72 hours.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-700 shadow-sm dark:bg-red-950/40 dark:text-red-300"
                >
                  <AlertIcon />
                </span>
                <span>API error logs</span>
              </span>
              <span>{MOCK_API_ERROR_LOGS.length} entries</span>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Endpoint</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_API_ERROR_LOGS.map((log, index) => (
                    <tr
                      key={log.id}
                      className={[
                        "text-xs",
                        index % 2 === 1
                          ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-4 py-2 font-mono text-[11px] text-zinc-700 dark:text-zinc-200">
                        {log.endpoint}
                      </td>
                      <td className="px-4 py-2 text-red-600 dark:text-red-300">
                        {log.statusCode}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.message}
                      </td>
                      <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-[10px] text-amber-700 shadow-sm dark:bg-amber-950/40 dark:text-amber-300"
                >
                  <WalletLogIcon />
                </span>
                <span>Payment failure logs</span>
              </span>
              <span>{MOCK_PAYMENT_FAILURE_LOGS.length} entries</span>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Razorpay ID</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAYMENT_FAILURE_LOGS.map((log, index) => (
                    <tr
                      key={log.id}
                      className={[
                        "text-xs",
                        index % 2 === 1
                          ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-4 py-2 font-mono text-[11px] text-zinc-700 dark:text-zinc-200">
                        {log.userId}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        ₹{log.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 font-mono text-[11px] text-zinc-700 dark:text-zinc-200">
                        {log.razorpayPaymentId}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.reason}
                      </td>
                      <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-700 shadow-sm dark:bg-red-950/40 dark:text-red-300"
                >
                  <AlertIcon />
                </span>
                <span>Session crash / force-stop records</span>
              </span>
              <span>{MOCK_SESSION_CRASH_LOGS.length} entries</span>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Context</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SESSION_CRASH_LOGS.map((log, index) => (
                    <tr
                      key={log.id}
                      className={[
                        "text-xs",
                        index % 2 === 1
                          ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-4 py-2 font-mono text-[11px] text-zinc-700 dark:text-zinc-200">
                        {log.userId}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.platform}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.context}
                      </td>
                      <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <ClockIcon />
                </span>
                <span>Admin action logs</span>
              </span>
              <span>{MOCK_ADMIN_ACTION_LOGS.length} entries</span>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ADMIN_ACTION_LOGS.map((log, index) => (
                    <tr
                      key={log.id}
                      className={[
                        "text-xs",
                        index % 2 === 1
                          ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.adminEmail}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.action}
                      </td>
                      <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                        {log.target}
                      </td>
                      <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}


