'use client';

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminUser, findAdminUserById } from "@/lib/mock-users";
import { MOCK_WALLET_TRANSACTIONS } from "@/lib/mock-wallet";
import { MOCK_SESSION_EVENTS } from "@/lib/mock-sessions";
import {
  AdminOcrStatus,
  AdminOcrSubmission,
  MOCK_OCR_SUBMISSIONS,
} from "@/lib/mock-ocr-submissions";
import { AdminInput, AdminTextarea } from "@/components/admin-input";
import { AdminButton } from "@/components/admin-button";
import {
  BadgeIcon,
  EmailIcon,
  PushIcon,
  SprintIcon,
  WalletIcon,
} from "@/components/icons";

type WalletAdjustment = {
  amount: number;
  reason: string;
  createdAt: string;
};

type UserFeatureFlags = {
  walletEnabled: boolean;
  badgeRewardsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  betaAccessEnabled: boolean;
};

type FeatureAlert = {
  title: string;
  description: string;
};

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_TIME_FORMAT.format(date);
}

function getOcrStatusStyles(status: AdminOcrStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "fined":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
    case "review":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "pending":
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300";
  }
}

function getOcrAnalysisStyles(result: AdminOcrSubmission["analysisResult"]) {
  switch (result) {
    case "clean":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "blurry":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "mismatch":
    case "suspicious":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300";
  }
}

function getOcrAccuracyStyles(flag: AdminOcrSubmission["accuracyFlag"]) {
  switch (flag) {
    case "pass":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "fail":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
    case "review":
    default:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  }
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userIdParam = params.id;
  const userId =
    typeof userIdParam === "string"
      ? userIdParam
      : Array.isArray(userIdParam)
        ? userIdParam[0]
        : "";
  const initialUser = useMemo(
    () => (userId ? findAdminUserById(userId) ?? null : null),
    [userId],
  );

  const [user, setUser] = useState<AdminUser | null>(initialUser);
  const [isResettingAvatar, setIsResettingAvatar] = useState(false);
  const [isTogglingDisable, setIsTogglingDisable] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [walletAdjustments, setWalletAdjustments] = useState<
    WalletAdjustment[]
  >([]);
  const [ocrSubmissions, setOcrSubmissions] = useState<AdminOcrSubmission[]>(
    () =>
      initialUser
        ? MOCK_OCR_SUBMISSIONS.filter(
            (submission) => submission.userId === initialUser.id,
          ).sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() -
              new Date(a.submittedAt).getTime(),
          )
        : [],
  );
  const [featureFlags, setFeatureFlags] = useState<UserFeatureFlags>({
    walletEnabled: true,
    badgeRewardsEnabled: true,
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    betaAccessEnabled: false,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featureAlert, setFeatureAlert] = useState<FeatureAlert | null>(null);
  const [pendingFeatureKey, setPendingFeatureKey] =
    useState<keyof UserFeatureFlags | null>(null);

  const userTransactions = useMemo(
    () =>
      user
        ? MOCK_WALLET_TRANSACTIONS.filter(
            (transaction) => transaction.userId === user.id,
          )
        : [],
    [user],
  );

  const userSessions = useMemo(() => {
    if (!user) return [];
    return MOCK_SESSION_EVENTS.filter(
      (session) => session.userId === user.id,
    ).sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }, [user]);

  const [adminNotes, setAdminNotes] = useState<
    { id: string; text: string; createdAt: string }[]
  >([]);
  const [newNote, setNewNote] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-1 text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300"
          >
            ← Back to users
          </button>
          <div className="rounded-2xl bg-white p-6 text-sm text-zinc-600 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800">
            User not found.
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = user.isDisabled
    ? "Disabled"
    : user.isActive
      ? "Active"
      : "Inactive";

  function handleToggleDisable() {
    setIsTogglingDisable(true);
    setMessage(null);
    setUser((current) => {
      if (!current) return current;
      const next = {
        ...current,
        isDisabled: !current.isDisabled,
        isActive: !current.isDisabled ? false : current.isActive,
      };
      setMessage(
        next.isDisabled
          ? "User has been soft-blocked (disabled)."
          : "User has been re-enabled.",
      );
      return next;
    });
    setTimeout(() => setIsTogglingDisable(false), 250);
  }

  function handleResetAvatar() {
    setIsResettingAvatar(true);
    setMessage(null);
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, avatar: "Default avatar" };
      setMessage("Avatar has been reset to default.");
      return next;
    });
    setTimeout(() => setIsResettingAvatar(false), 250);
  }

  function handleDeleteAccount() {
    // UI-only for now – in a real app this would call an admin API
    setIsDeleting(true);
    setMessage(
      "Account deletion has been requested (UI-only). Wire this button to a backend endpoint to perform a real delete.",
    );
    setTimeout(() => setIsDeleting(false), 400);
  }

  function getFeatureLabel(key: keyof UserFeatureFlags): string {
    return key === "walletEnabled"
      ? "Wallet access"
      : key === "badgeRewardsEnabled"
        ? "Badge rewards"
        : key === "emailNotificationsEnabled"
          ? "Email notifications"
          : key === "pushNotificationsEnabled"
            ? "Push notifications"
            : "Beta / experimental features";
  }

  function applyFeatureToggle(key: keyof UserFeatureFlags, nextEnabled: boolean) {
    setFeatureFlags((current) => {
      const featureLabel = getFeatureLabel(key);

      setFeatureAlert((previous) => ({
        title: `${featureLabel} ${
          nextEnabled ? "enabled" : "disabled"
        } for ${user?.avatar ?? "this user"}`,
        description:
          "These changes are simulated in the admin UI and can be wired to backend enforcement later.",
      }));

      return {
        ...current,
        [key]: nextEnabled,
      };
    });
  }

  function handleFeatureToggleClick(key: keyof UserFeatureFlags) {
    const currentlyEnabled = featureFlags[key];
    // If currently disabled, ask for confirmation before enabling.
    if (!currentlyEnabled) {
      setPendingFeatureKey(key);
      return;
    }
    // If currently enabled, disable immediately.
    applyFeatureToggle(key, false);
  }

  function handleConfirmEnableFeature() {
    if (!pendingFeatureKey) return;
    applyFeatureToggle(pendingFeatureKey, true);
    setPendingFeatureKey(null);
  }

  function handleCancelEnableFeature() {
    setPendingFeatureKey(null);
  }

  function handleAddNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newNote.trim();
    if (!text) return;

    const note = {
      id: `note_${adminNotes.length + 1}`,
      text,
      createdAt: new Date().toISOString(),
    };
    setAdminNotes((previous) => [note, ...previous]);
    setNewNote("");
  }

  function handleWalletSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsed = Number.parseFloat(walletAmount);
    if (!Number.isFinite(parsed) || parsed === 0) {
      setMessage("Enter a non-zero amount to credit or debit.");
      return;
    }
    if (!walletReason.trim()) {
      setMessage("Please provide a short reason for the adjustment.");
      return;
    }

    const now = new Date().toISOString();

    setUser((current) => {
      if (!current) return current;
      const next = {
        ...current,
        walletBalance: current.walletBalance + parsed,
      };
      return next;
    });

    setWalletAdjustments((previous) => [
      {
        amount: parsed,
        reason: walletReason.trim(),
        createdAt: now,
      },
      ...previous,
    ]);

    setWalletAmount("");
    setWalletReason("");
    setMessage(
      parsed > 0
        ? "Wallet credited successfully."
        : "Wallet debited successfully.",
    );
  }

  function handleOcrOverride(submissionId: string, nextStatus: AdminOcrStatus) {
    setOcrSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === submissionId
          ? { ...submission, status: nextStatus }
          : submission,
      ),
    );
    setMessage(
      `OCR submission ${submissionId} marked as ${nextStatus.replace(
        "_",
        " ",
      )}.`,
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300"
        >
          ← Back to users
        </button>

        <header className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-sm font-semibold text-white shadow-sm dark:from-emerald-400 dark:to-sky-400"
            >
              {getAvatarInitials(user.avatar)}
            </span>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {user.avatar}
              </h1>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {user.id}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Detailed profile, history, and admin actions.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
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
              {statusLabel}
            </span>
          </div>
        </header>

        {message ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        <main className="grid gap-4 md:grid-cols-3">
          <section className="space-y-4 md:col-span-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Profile
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Mobile
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1 text-zinc-900 dark:text-zinc-50">
                    <span>{user.phone}</span>
                    {user.phoneVerified ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-400 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span aria-hidden="true">✔</span>
                        <span className="sr-only">Phone verified</span>
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Email
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1 break-all text-zinc-900 dark:text-zinc-50">
                    <span>{user.email}</span>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-400 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span aria-hidden="true">✔</span>
                        <span className="sr-only">Email verified</span>
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Avatar
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-xs font-semibold text-white shadow-sm dark:from-emerald-400 dark:to-sky-400"
                    >
                      {getAvatarInitials(user.avatar)}
                    </span>
                    <span>{user.avatar}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Registered
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                    {formatDateTime(user.registeredAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Current streak
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                    {user.currentStreakDays} days
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Subscription
                  </dt>
                  <dd className="mt-0.5">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        user.subscriptionTier === "premium"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {user.subscriptionTier === "premium" ? "Premium" : "Normal"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Last active
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                    {formatDateTime(user.lastActiveAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Refund eligible today
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                    ₹{user.refundEligibleAmount.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Total fines collected
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                    ₹{user.totalFineCollected.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Signup source
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                    {user.signupSource}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Verification
                  </dt>
                  <dd className="mt-0.5 space-x-2 text-xs text-zinc-700 dark:text-zinc-200">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5",
                        user.phoneVerified
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      Phone {user.phoneVerified ? "verified" : "unverified"}
                    </span>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5",
                        user.emailVerified
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      Email {user.emailVerified ? "verified" : "unverified"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Session history
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Aggregate overview of this user&apos;s focus sessions.
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Sessions (last 7 days)
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      24
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Sessions (last 30 days)
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      82
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Recent sessions
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Last few focus sessions for this user.
                </p>
                {userSessions.length === 0 ? (
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    No sessions recorded in the mock data.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-200">
                    {userSessions.slice(0, 5).map((session) => (
                      <li
                        key={session.id}
                        className="flex items-start justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
                      >
                        <div>
                          <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                            {session.id}
                          </p>
                          <p className="mt-0.5">
                            {formatDateTime(session.startTime)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            Distance: {session.distanceEarnedKm.toFixed(1)} km
                          </p>
                        </div>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                            session.status === "completed" &&
                              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                            session.status !== "completed" &&
                              "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {session.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Performance
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Total focus time
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      186 h
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Distance covered
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      42 km
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Badge status
                    </dt>
                    <dd className="flex flex-wrap gap-1">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Focused
                      </span>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        Streak Master
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Device &amp; platform
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Last device
                    </dt>
                    <dd className="font-medium text-zinc-900 capitalize dark:text-zinc-50">
                      {user.lastDeviceType}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      App version
                    </dt>
                    <dd className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {user.lastAppVersion}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600 dark:text-zinc-300">
                      Location
                    </dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {user.lastLocation}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 md:col-span-2">
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  OCR submission history
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Screenshot OCR checks with question counts, accuracy flags, and
                  quick overrides.
                </p>
                {ocrSubmissions.length === 0 ? (
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    No OCR submissions on record for this user.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-xs">
                      <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                        <tr>
                          <th className="px-3 py-2">Submitted</th>
                          <th className="px-3 py-2">Screenshot</th>
                          <th className="px-3 py-2">Analysis</th>
                          <th className="px-3 py-2">Questions</th>
                          <th className="px-3 py-2">Accuracy</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2 text-right">Overrides</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocrSubmissions.map((submission, index) => (
                          <tr
                            key={submission.id}
                            className={[
                              "text-xs text-zinc-700 dark:text-zinc-200",
                              index % 2 === 1
                                ? "bg-zinc-50/60 dark:bg-zinc-950/50"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <td className="whitespace-nowrap px-3 py-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatDateTime(submission.submittedAt)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                              {submission.screenshotLabel}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={[
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  getOcrAnalysisStyles(submission.analysisResult),
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {submission.analysisResult}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                              {submission.questionCount}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={[
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                  getOcrAccuracyStyles(submission.accuracyFlag),
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {submission.accuracyFlag}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={[
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                                  getOcrStatusStyles(submission.status),
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {submission.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOcrOverride(
                                      submission.id,
                                      "approved",
                                    )
                                  }
                                  disabled={submission.status === "approved"}
                                  className="rounded-md border border-emerald-200 px-2 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOcrOverride(submission.id, "review")
                                  }
                                  disabled={submission.status === "review"}
                                  className="rounded-md border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
                                >
                                  Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOcrOverride(submission.id, "fined")
                                  }
                                  disabled={submission.status === "fined"}
                                  className="rounded-md border border-rose-200 px-2 py-1 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/40"
                                >
                                  Fine
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Wallet
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Current balance and manual adjustments.
              </p>
              <p className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                ₹{user.walletBalance.toFixed(2)}
              </p>
              {user.walletBalance <= 0 ? (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                  This user has no active wallet balance yet. Once they complete
                  the initial ₹200 deposit in the app, their funded balance will
                  show here.
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Balance is backed by the user&apos;s deposit. Use adjustments
                  cautiously and log a clear reason for audit.
                </p>
              )}

              <form className="mt-4 space-y-3" onSubmit={handleWalletSubmit}>
                <AdminInput
                  id="wallet-amount"
                  label="Amount"
                  type="number"
                  step="0.01"
                  placeholder="+10.00 or -5.00"
                  value={walletAmount}
                  onChange={(event) => setWalletAmount(event.target.value)}
                />
                <AdminTextarea
                  id="wallet-reason"
                  label="Reason"
                  rows={2}
                  placeholder="Short explanation for audit trail"
                  value={walletReason}
                  onChange={(event) => setWalletReason(event.target.value)}
                />
                <AdminButton type="submit" fullWidth>
                  Apply adjustment
                </AdminButton>
              </form>

              {walletAdjustments.length > 0 ? (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Recent adjustments
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {walletAdjustments.map((adjustment, index) => (
                      <li key={index} className="flex flex-col">
                        <span>
                          {adjustment.amount > 0 ? "+" : "-"}
                          {Math.abs(adjustment.amount).toFixed(2)} •{" "}
                          {adjustment.reason}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {formatDateTime(adjustment.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {userTransactions.length > 0 ? (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Wallet transactions
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {userTransactions.map((transaction) => (
                      <li key={transaction.id} className="flex flex-col">
                        <span>
                          ₹{transaction.amount.toFixed(2)} •{" "}
                          {transaction.status} • {transaction.method} •{" "}
                          {transaction.razorpayPaymentId}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {formatDateTime(transaction.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Feature access
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enable or disable specific features just for this user. These
                flags are local to the admin UI for now and can later be wired
                to backend enforcement.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleFeatureToggleClick("walletEnabled")}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <WalletIcon />
                    </span>
                    <span>
                      <span className="block text-xs font-medium">
                        Wallet features
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        Deposits, redemptions, and wallet-based incentives.
                      </span>
                    </span>
                  </span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      featureFlags.walletEnabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {featureFlags.walletEnabled ? "Enabled" : "Disabled"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFeatureToggleClick("badgeRewardsEnabled")}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <BadgeIcon />
                    </span>
                    <span>
                      <span className="block text-xs font-medium">
                        Badge rewards
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        Earning new badges and progress indicators.
                      </span>
                    </span>
                  </span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      featureFlags.badgeRewardsEnabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {featureFlags.badgeRewardsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFeatureToggleClick("emailNotificationsEnabled")
                  }
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <EmailIcon />
                    </span>
                    <span>
                      <span className="block text-xs font-medium">
                        Email notifications
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        Session summaries and account alerts for this user.
                      </span>
                    </span>
                  </span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      featureFlags.emailNotificationsEnabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {featureFlags.emailNotificationsEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFeatureToggleClick("pushNotificationsEnabled")
                  }
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <PushIcon />
                    </span>
                    <span>
                      <span className="block text-xs font-medium">
                        Push notifications
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        Session reminders and streak nudges for this user.
                      </span>
                    </span>
                  </span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      featureFlags.pushNotificationsEnabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {featureFlags.pushNotificationsEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFeatureToggleClick("betaAccessEnabled")}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <SprintIcon />
                    </span>
                    <span>
                      <span className="block text-xs font-medium">
                        Beta / experimental features
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        Early access to upcoming experiments and flows.
                      </span>
                    </span>
                  </span>
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      featureFlags.betaAccessEnabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {featureFlags.betaAccessEnabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Admin actions
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                These actions are simulated in the admin UI and can later be
                wired to backend APIs for real enforcement.
              </p>
              <AdminButton
                variant={user.isDisabled ? "primary" : "danger"}
                fullWidth
                disabled={isTogglingDisable}
                onClick={handleToggleDisable}
              >
                {user.isDisabled ? "Activate user" : "Deactivate (soft block)"}
              </AdminButton>
              <AdminButton
                variant="outline"
                fullWidth
                disabled={isResettingAvatar}
                onClick={handleResetAvatar}
              >
                Reset avatar
              </AdminButton>
              <AdminButton
                variant="danger"
                fullWidth
                disabled={isDeleting}
                onClick={handleDeleteAccount}
              >
                Delete account
              </AdminButton>
            </div>

            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Admin notes &amp; tags
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Leave internal notes and tag this account for future reference.
              </p>
              <form className="space-y-2" onSubmit={handleAddNote}>
                <AdminTextarea
                  id="admin-note"
                  label="Add note"
                  rows={2}
                  placeholder="E.g. reached out about payment issue…"
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                />
                <AdminButton type="submit" size="md" fullWidth>
                  Save note
                </AdminButton>
              </form>
              {adminNotes.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Recent notes
                  </p>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {adminNotes.map((note) => (
                      <li key={note.id} className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
                        <p>{note.text}</p>
                        <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                          {formatDateTime(note.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {user.tags.length > 0 ? (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </main>
      </div>

      {featureAlert ? (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-xs shadow-lg shadow-emerald-100 dark:border-emerald-800 dark:bg-zinc-950 dark:shadow-emerald-900/30">
          <div className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              ✔
            </span>
            <div className="flex-1">
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                {featureAlert.title}
              </p>
              <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                {featureAlert.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeatureAlert(null)}
              className="ml-1 rounded-full p-1 text-[10px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              aria-label="Dismiss feature alert"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {pendingFeatureKey ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-sm shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Enable {getFeatureLabel(pendingFeatureKey)}?
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              This will enable {getFeatureLabel(pendingFeatureKey).toLowerCase()}{" "}
              just for{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {user.avatar}
              </span>{" "}
              in the admin UI. You can later wire this to backend enforcement.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEnableFeature}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEnableFeature}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                Enable feature
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


