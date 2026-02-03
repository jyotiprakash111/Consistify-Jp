'use client';

import { useMemo } from "react";
import { MOCK_ADMIN_USERS } from "@/lib/mock-users";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return `₹${NUMBER_FORMAT.format(value)}`;
}

export default function FineCollectionPage() {
  const totals = useMemo(() => {
    return MOCK_ADMIN_USERS.reduce(
      (acc, user) => {
        acc.totalWallet += user.walletBalance;
        acc.totalFines += user.totalFineCollected;
        acc.totalApplicableToday += user.refundEligibleAmount;
        return acc;
      },
      {
        totalWallet: 0,
        totalFines: 0,
        totalApplicableToday: 0,
      },
    );
  }, []);

  const totalDifferenceToday =
    totals.totalWallet - totals.totalApplicableToday;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Fine Collection
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Wallet balance, fine collection, and refund exposure as of today.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total wallet balance
            </p>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totals.totalWallet)}
            </p>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total fine collected
            </p>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totals.totalFines)}
            </p>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total applicable today
            </p>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totals.totalApplicableToday)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Refund exposure if users quit today.
            </p>
          </article>
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Difference as of today
            </p>
            <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totalDifferenceToday)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Wallet balance minus applicable refunds.
            </p>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>User breakdown</span>
            <span>{MOCK_ADMIN_USERS.length} accounts</span>
          </div>
          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Wallet balance</th>
                  <th className="px-4 py-3">Fine collected</th>
                  <th className="px-4 py-3">Applicable today</th>
                  <th className="px-4 py-3">Difference</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ADMIN_USERS.map((user, index) => {
                  const difference =
                    user.walletBalance - user.refundEligibleAmount;
                  return (
                    <tr
                      key={user.id}
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
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {user.avatar}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {user.id}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                            user.subscriptionTier === "premium"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {user.subscriptionTier === "premium"
                            ? "Premium"
                            : "Normal"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {formatCurrency(user.walletBalance)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {formatCurrency(user.totalFineCollected)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {formatCurrency(user.refundEligibleAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {formatCurrency(difference)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
