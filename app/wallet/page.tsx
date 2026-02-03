'use client';

import { useMemo, useState } from "react";
import {
  MOCK_WALLET_OVERVIEW,
  MOCK_WALLET_TRANSACTIONS,
  WalletTransaction,
  hasFraudFlags,
} from "@/lib/mock-wallet";
import { RupeeStackIcon, WalletIcon } from "@/components/icons/wallet";

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

type ManualCredit = {
  id: string;
  userId: string;
  amount: number;
  note: string;
  createdAt: string;
};

type BulkAction = "topup" | "sessionReset";

type SessionReset = {
  id: string;
  userId: string;
  reason: string;
  createdAt: string;
};

type FraudAlert = {
  id: string;
  userId: string;
  reason: string;
  createdAt: string;
  transactionIds: string[];
};

export default function WalletPage() {
  const [credits, setCredits] = useState<ManualCredit[]>([]);
  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>(
    [],
  );
  const [bulkAction, setBulkAction] = useState<BulkAction>("topup");
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  const [sessionResets, setSessionResets] = useState<SessionReset[]>([]);
  const [reconciledTransactions, setReconciledTransactions] = useState<
    string[]
  >([]);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>([]);

  const selectedUserIds = useMemo(() => {
    const ids = new Set<string>();
    MOCK_WALLET_TRANSACTIONS.forEach((transaction) => {
      if (selectedTransactionIds.includes(transaction.id)) {
        ids.add(transaction.userId);
      }
    });
    return Array.from(ids);
  }, [selectedTransactionIds]);

  const fraudAlerts = useMemo<FraudAlert[]>(() => {
    const alerts: FraudAlert[] = [];
    const alertKeys = new Set<string>();
    const byUser = new Map<string, WalletTransaction[]>();

    MOCK_WALLET_TRANSACTIONS.forEach((transaction) => {
      const current = byUser.get(transaction.userId) ?? [];
      current.push(transaction);
      byUser.set(transaction.userId, current);
    });

    byUser.forEach((transactions, userId) => {
      const sorted = [...transactions].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const rapidWindowMs = 10 * 60 * 1000;
      for (let i = 0; i < sorted.length; i += 1) {
        const windowStart = new Date(sorted[i].createdAt).getTime();
        const windowItems = sorted.filter(
          (item) =>
            new Date(item.createdAt).getTime() - windowStart <= rapidWindowMs,
        );
        const rapidDeposits = windowItems.filter((item) => item.amount > 0);
        if (rapidDeposits.length >= 3) {
          const key = `${userId}-rapid-deposits`;
          if (!alertKeys.has(key)) {
            alertKeys.add(key);
            alerts.push({
              id: `alert_${userId}_rapid_deposits`,
              userId,
              reason: "Rapid deposits within 10 minutes",
              createdAt: rapidDeposits[rapidDeposits.length - 1].createdAt,
              transactionIds: rapidDeposits.map((item) => item.id),
            });
          }
        }
      }

      const withdrawals = sorted.filter((item) => item.amount < 0);
      if (withdrawals.length >= 2) {
        const first = new Date(withdrawals[0].createdAt).getTime();
        const last = new Date(
          withdrawals[withdrawals.length - 1].createdAt,
        ).getTime();
        if (last - first <= 15 * 60 * 1000) {
          const key = `${userId}-rapid-withdrawals`;
          if (!alertKeys.has(key)) {
            alertKeys.add(key);
            alerts.push({
              id: `alert_${userId}_rapid_withdrawals`,
              userId,
              reason: "Multiple withdrawals within 15 minutes",
              createdAt: withdrawals[withdrawals.length - 1].createdAt,
              transactionIds: withdrawals.map((item) => item.id),
            });
          }
        }
      }

      const flagged = sorted.filter((item) => hasFraudFlags(item));
      if (flagged.length > 0) {
        const key = `${userId}-flagged`;
        if (!alertKeys.has(key)) {
          alertKeys.add(key);
          alerts.push({
            id: `alert_${userId}_flagged`,
            userId,
            reason: "High retries or refunds detected",
            createdAt: flagged[flagged.length - 1].createdAt,
            transactionIds: flagged.map((item) => item.id),
          });
        }
      }
    });

    return alerts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, []);

  const visibleAlerts = useMemo(
    () => fraudAlerts.filter((alert) => !resolvedAlertIds.includes(alert.id)),
    [fraudAlerts, resolvedAlertIds],
  );

  function handleRetryVerification(transaction: WalletTransaction) {
    setMessage(
      `Retrying verification for ${transaction.id} (simulated – wire to Razorpay API in production).`,
    );
  }

  function handleCreditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsedAmount = Number.parseFloat(creditAmount);
    if (!creditUserId.trim()) {
      setMessage("User ID is required for manual credit.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage("Enter a positive amount to credit.");
      return;
    }
    if (!creditNote.trim()) {
      setMessage("Please provide a short admin note.");
      return;
    }

    const credit: ManualCredit = {
      id: `manual_${credits.length + 1}`,
      userId: creditUserId.trim(),
      amount: parsedAmount,
      note: creditNote.trim(),
      createdAt: new Date().toISOString(),
    };

    setCredits((previous) => [credit, ...previous]);
    setCreditUserId("");
    setCreditAmount("");
    setCreditNote("");
    setMessage("Manual credit recorded locally (wire to backend for real use).");
  }

  function toggleTransactionSelection(id: string) {
    setSelectedTransactionIds((previous) =>
      previous.includes(id)
        ? previous.filter((existing) => existing !== id)
        : [...previous, id],
    );
  }

  function toggleSelectAllTransactions() {
    if (selectedTransactionIds.length === MOCK_WALLET_TRANSACTIONS.length) {
      setSelectedTransactionIds([]);
      return;
    }
    setSelectedTransactionIds(MOCK_WALLET_TRANSACTIONS.map((item) => item.id));
  }

  function handleBulkActionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (selectedUserIds.length === 0) {
      setMessage("Select at least one user from the transactions table first.");
      return;
    }

    if (bulkAction === "topup") {
      const parsedAmount = Number.parseFloat(bulkAmount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setMessage("Enter a positive top-up amount.");
        return;
      }
      if (!bulkNote.trim()) {
        setMessage("Add a short reason for the bulk top-up.");
        return;
      }

      const now = new Date().toISOString();
      const creditsToAdd = selectedUserIds.map((userId, index) => ({
        id: `bulk_${now}_${index + 1}`,
        userId,
        amount: parsedAmount,
        note: bulkNote.trim(),
        createdAt: now,
      }));
      setCredits((previous) => [...creditsToAdd, ...previous]);
      setMessage(
        `Bulk top-up applied to ${selectedUserIds.length} user(s) (simulated).`,
      );
      setBulkAmount("");
      setBulkNote("");
    } else {
      const now = new Date().toISOString();
      const resets = selectedUserIds.map((userId, index) => ({
        id: `reset_${now}_${index + 1}`,
        userId,
        reason: bulkNote.trim() || "Bulk session reset",
        createdAt: now,
      }));
      setSessionResets((previous) => [...resets, ...previous]);
      setMessage(
        `Queued session resets for ${selectedUserIds.length} user(s) (simulated).`,
      );
      setBulkNote("");
    }
  }

  function handleReconcileTransaction(transaction: WalletTransaction) {
    setReconciledTransactions((previous) => [
      ...new Set([...previous, transaction.id]),
    ]);
    setMessage(
      `Transaction ${transaction.id} reconciled (simulated).`,
    );
  }

  function handleResolveAlert(alert: FraudAlert) {
    setResolvedAlertIds((previous) => [...previous, alert.id]);
    setReconciledTransactions((previous) => [
      ...new Set([...previous, ...alert.transactionIds]),
    ]);
    setMessage(
      `Alert resolved for ${alert.userId} with ${alert.transactionIds.length} transaction(s).`,
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Wallet &amp; Payment Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track deposits, wallet balances, and payment integrity.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        {MOCK_WALLET_OVERVIEW.totalDeposits === 0 &&
        MOCK_WALLET_TRANSACTIONS.length === 0 ? (
          <section className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-dashed ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              No deposits processed yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Once a user completes the first ₹200 deposit via Razorpay, this
              view will populate with wallet balances and transaction history.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-500 dark:text-zinc-400">
              <li>Per-user wallet balances and active deposit amounts.</li>
              <li>Full Razorpay transaction logs with status and timestamps.</li>
              <li>Fraud flags and manual credit actions for reconciliation.</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Use this page during early testing to confirm that Razorpay
              webhooks, wallet credits, and admin overrides are all working
              correctly.
            </p>
          </section>
        ) : null}
        {message ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <RupeeStackIcon />
                </div>
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Total deposits collected
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Gross value processed via Razorpay UPI.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              ₹{formatNumber(MOCK_WALLET_OVERVIEW.totalDeposits)}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <WalletIcon />
                </div>
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Total active wallet balances
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Sum of user wallets currently available for spending.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              ₹{formatNumber(MOCK_WALLET_OVERVIEW.totalActiveBalances)}
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Bulk actions
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Apply wallet top-ups or session resets across selected users.
            </p>
            <form className="mt-3 space-y-3" onSubmit={handleBulkActionSubmit}>
              <div>
                <label
                  htmlFor="bulk-action"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Action
                </label>
                <select
                  id="bulk-action"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={bulkAction}
                  onChange={(event) =>
                    setBulkAction(event.target.value as BulkAction)
                  }
                >
                  <option value="topup">Wallet top-up</option>
                  <option value="sessionReset">Session reset</option>
                </select>
              </div>
              {bulkAction === "topup" ? (
                <div>
                  <label
                    htmlFor="bulk-amount"
                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                  >
                    Amount (₹)
                  </label>
                  <input
                    id="bulk-amount"
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                    value={bulkAmount}
                    onChange={(event) => setBulkAmount(event.target.value)}
                  />
                </div>
              ) : null}
              <div>
                <label
                  htmlFor="bulk-note"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Admin note
                </label>
                <textarea
                  id="bulk-note"
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  placeholder="Reason for this bulk action"
                  value={bulkNote}
                  onChange={(event) => setBulkNote(event.target.value)}
                />
              </div>
              <div className="rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {selectedUserIds.length === 0
                  ? "Select users from the transaction list to enable bulk actions."
                  : `${selectedUserIds.length} user(s) selected: ${selectedUserIds.join(", ")}`}
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Apply bulk action
              </button>
            </form>

            {sessionResets.length > 0 ? (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Recent session resets
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {sessionResets.slice(0, 3).map((reset) => (
                    <li key={reset.id} className="flex flex-col">
                      <span>
                        {reset.userId} • {reset.reason}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatDateTime(reset.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Automated fraud alerts
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Rapid deposits/withdrawals and high retry or refund activity.
            </p>
            {visibleAlerts.length === 0 ? (
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                No active fraud alerts. You&apos;re all clear.
              </p>
            ) : (
              <div className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-200">
                {visibleAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3 dark:border-rose-900/40 dark:bg-rose-950/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
                          {alert.userId}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                          {alert.reason}
                        </p>
                        <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-200">
                          {alert.transactionIds.length} transaction(s) •{" "}
                          {formatDateTime(alert.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResolveAlert(alert)}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/50"
                      >
                        Reconcile in one click
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Affects: {alert.transactionIds.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span>Transactions</span>
              <span>{MOCK_WALLET_TRANSACTIONS.length} records</span>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all transactions"
                        checked={
                          MOCK_WALLET_TRANSACTIONS.length > 0 &&
                          selectedTransactionIds.length ===
                            MOCK_WALLET_TRANSACTIONS.length
                        }
                        onChange={toggleSelectAllTransactions}
                        className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Razorpay ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date &amp; time</th>
                    <th className="px-4 py-3">Fraud flags</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_WALLET_TRANSACTIONS.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400"
                      >
                        No wallet transactions recorded yet. After users
                        complete their first deposits, they will appear here
                        with status and Razorpay IDs.
                      </td>
                    </tr>
                  ) : (
                    MOCK_WALLET_TRANSACTIONS.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={[
                          "align-top text-sm",
                          index % 2 === 1
                            ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${transaction.id}`}
                            checked={selectedTransactionIds.includes(
                              transaction.id,
                            )}
                            onChange={() =>
                              toggleTransactionSelection(transaction.id)
                            }
                            className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-200">
                          {transaction.userId}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                          ₹{transaction.amount.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                          {transaction.method}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                          {transaction.razorpayPaymentId}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                              transaction.status === "success" &&
                                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                              transaction.status === "failed" &&
                                "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                              transaction.status === "pending" &&
                                "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200">
                          {formatDateTime(transaction.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-700 dark:text-zinc-200">
                          {hasFraudFlags(transaction) ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                              Potential fraud
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              —
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          {(() => {
                            const needsReconcile =
                              transaction.status !== "success" ||
                              hasFraudFlags(transaction);
                            const isReconciled = reconciledTransactions.includes(
                              transaction.id,
                            );

                            return (
                              <div className="flex flex-wrap items-center gap-2">
                                {transaction.status === "failed" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRetryVerification(transaction)
                                    }
                                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                  >
                                    Retry verification
                                  </button>
                                ) : null}
                                {isReconciled ? (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    Reconciled
                                  </span>
                                ) : needsReconcile ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReconcileTransaction(transaction)
                                    }
                                    className="rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                                  >
                                    Reconcile
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                    —
                                  </span>
                                )}
                              </div>
                            );
                          })()}
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
              Manual credit (admin-only)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use for reconciliation or offline payments. This is logged locally
              in the UI for now and should be wired to backend APIs for real
              usage.
            </p>
            <form className="space-y-3" onSubmit={handleCreditSubmit}>
              <div>
                <label
                  htmlFor="credit-user-id"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  User ID
                </label>
                <input
                  id="credit-user-id"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={creditUserId}
                  onChange={(event) => setCreditUserId(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="credit-amount"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Amount (₹)
                </label>
                <input
                  id="credit-amount"
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={creditAmount}
                  onChange={(event) => setCreditAmount(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="credit-note"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Admin note
                </label>
                <textarea
                  id="credit-note"
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                  value={creditNote}
                  onChange={(event) => setCreditNote(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Record manual credit
              </button>
            </form>

            {credits.length > 0 ? (
              <div className="space-y-1 pt-2">
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  Recent manual credits
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {credits.map((credit) => (
                    <li key={credit.id} className="flex flex-col">
                      <span>
                        {credit.userId} • ₹{credit.amount.toFixed(2)} •{" "}
                        {credit.note}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatDateTime(credit.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </section>
      </main>
    </div>
  );
}


