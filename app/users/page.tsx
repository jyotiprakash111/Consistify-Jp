'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminUser, MOCK_ADMIN_USERS } from "@/lib/mock-users";

type StatusFilter = "all" | "active" | "inactive";
type WalletFilter = "all" | "low";
type SortKey = "streak" | "partnerMatches" | "complianceRate";
type SortDirection = "asc" | "desc";

function getStatusLabel(user: AdminUser): string {
  if (user.isDisabled) return "Disabled";
  if (user.isActive) return "Active";
  return "Inactive";
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMAT.format(date);
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function UsersPage() {
  const router = useRouter();
  const [phoneQuery, setPhoneQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [walletFilter, setWalletFilter] = useState<WalletFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("streak");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("desc");
  }

  function getSortIndicator(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

  function getSortValue(user: AdminUser) {
    switch (sortKey) {
      case "partnerMatches":
        return user.partnerMatchCount;
      case "complianceRate":
        return user.complianceRate;
      case "streak":
      default:
        return user.currentStreakDays;
    }
  }

  const filteredUsers = useMemo(() => {
    const matches = MOCK_ADMIN_USERS.filter((user) => {
      const normalizedPhone = user.phone.toLowerCase();
      const normalizedQuery = phoneQuery.trim().toLowerCase();

      if (normalizedQuery && !normalizedPhone.includes(normalizedQuery)) {
        return false;
      }

      if (statusFilter === "active" && (!user.isActive || user.isDisabled)) {
        return false;
      }
      if (statusFilter === "inactive" && user.isActive && !user.isDisabled) {
        return false;
      }

      if (walletFilter === "low" && user.walletBalance >= 5) {
        return false;
      }

      return true;
    });

    return matches.sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      if (aValue === bValue) return 0;
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [phoneQuery, statusFilter, walletFilter, sortKey, sortDirection]);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Users
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Monitor, support, and moderate Consistify users.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-4">
        <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-xs">
            <label
              htmlFor="phone-search"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Search by phone number
            </label>
            <input
              id="phone-search"
              type="text"
              placeholder="+1 555"
              className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              value={phoneQuery}
              onChange={(event) => setPhoneQuery(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <label
                htmlFor="status-filter"
                className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Status
              </label>
              <select
                id="status-filter"
                className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive / disabled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="wallet-filter"
                className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Wallet
              </label>
              <select
                id="wallet-filter"
                className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                value={walletFilter}
                onChange={(event) =>
                  setWalletFilter(event.target.value as WalletFilter)
                }
              >
                <option value="all">All balances</option>
                <option value="low">Low balance (&lt; ₹5)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="max-h-[70vh] min-w-full overflow-y-auto">
            <table className="w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Refund today</th>
                  <th className="px-4 py-3">Total fines</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("streak")}
                      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <span>Streak days</span>
                      <span aria-hidden="true" className="text-[10px]">
                        {getSortIndicator("streak")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3">Last active</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("partnerMatches")}
                      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <span>Partner matches</span>
                      <span aria-hidden="true" className="text-[10px]">
                        {getSortIndicator("partnerMatches")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("complianceRate")}
                      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <span>Compliance rate</span>
                      <span aria-hidden="true" className="text-[10px]">
                        {getSortIndicator("complianceRate")}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No users match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={[
                        "text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-900",
                        index % 2 === 1
                          ? "bg-zinc-50/40 dark:bg-zinc-950/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/users/${user.id}`)}
                          className="cursor-pointer font-mono text-xs text-zinc-700 underline underline-offset-2 hover:underline dark:text-zinc-200"
                        >
                          {user.id}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                        {user.avatar}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                        {user.phone}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 capitalize dark:text-zinc-200">
                        {user.gender}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-semibold text-white shadow-sm dark:from-emerald-400 dark:to-sky-400"
                          >
                            {getAvatarInitials(user.avatar)}
                          </span>
                          <button
                            type="button"
                            onClick={() => router.push(`/users/${user.id}`)}
                            className="cursor-pointer text-sm font-medium text-zinc-900 underline underline-offset-2 hover:underline dark:text-zinc-50"
                          >
                            {user.avatar}
                          </button>
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
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {formatDate(user.registeredAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                        ₹{user.walletBalance.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        ₹{user.refundEligibleAmount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        ₹{user.totalFineCollected.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {user.currentStreakDays} days
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {formatDate(user.lastActiveAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {user.partnerMatchCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {(user.complianceRate * 100).toFixed(1)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            user.isDisabled &&
                              "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                            !user.isDisabled &&
                              user.isActive &&
                              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                            !user.isDisabled &&
                              !user.isActive &&
                              "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {getStatusLabel(user)}
                        </span>
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


