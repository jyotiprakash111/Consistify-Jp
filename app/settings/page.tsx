'use client';

import { useState } from "react";
import {
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_SYSTEM_CONFIG,
  FeatureFlags,
} from "@/lib/systemconfig";
import { MOCK_ADMIN_USERS } from "@/lib/mock-users";
import { ToggleFeatureCard } from "@/components/toggle-feature-card";
import {
  BadgeIcon,
  CelebrationIcon,
  CoinsIcon,
  EmailIcon,
  GatewayIcon,
  MaintenanceIcon,
  PushIcon,
  RupeeConfigIcon,
  SprintIcon,
  SwitchesIcon,
  UserOverridesIcon,
  WalletIcon,
} from "@/components/icons";

type UserOverrideFlags = {
  walletEnabled: boolean;
  badgeRewardsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
};

type GlobalFeatureKey = keyof FeatureFlags;
type PaymentFeatureKey = "upiEnabled" | "cardsEnabled";
type UserOverrideKey = keyof UserOverrideFlags;

type FeatureAlert = {
  title: string;
  description: string;
};

type PendingToggle =
  | { kind: "global"; key: GlobalFeatureKey }
  | { kind: "payment"; key: PaymentFeatureKey }
  | { kind: "override"; key: UserOverrideKey; userId: string };

export default function SettingsPage() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    MOCK_ADMIN_USERS[0]?.id ?? "",
  );
  const [userOverrides, setUserOverrides] = useState<
    Record<string, UserOverrideFlags>
  >({});

  const [paymentConfig, setPaymentConfig] = useState(
    DEFAULT_SYSTEM_CONFIG.payment,
  );
  const [isSavingPaymentConfig, setIsSavingPaymentConfig] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(
    null,
  );
  const [featureAlert, setFeatureAlert] = useState<FeatureAlert | null>(null);

  function getGlobalFeatureLabel(key: GlobalFeatureKey): string {
    switch (key) {
      case "walletEnforcementEnabled":
        return "Wallet enforcement";
      case "badgeRewardsEnabled":
        return "Badge rewards";
      case "maintenanceModeEnabled":
        return "Maintenance mode";
      case "emailNotificationsEnabled":
        return "Email notifications";
      case "pushNotificationsEnabled":
        return "Push notifications";
      case "coinsEnabled":
        return "Coins (in-app currency)";
      case "sprintModeEnabled":
        return "Sprint mode";
      case "avatarCelebrationEnabled":
        return "Avatar celebrations";
      case "depositAmountInRupees":
        return "Default deposit amount";
      default:
        return "Feature";
    }
  }

  function getOverrideLabel(key: UserOverrideKey): string {
    switch (key) {
      case "walletEnabled":
        return "Wallet features";
      case "badgeRewardsEnabled":
        return "Badge rewards";
      case "emailNotificationsEnabled":
        return "Email notifications";
      case "pushNotificationsEnabled":
        return "Push notifications";
      default:
        return "Feature overrides";
    }
  }

  function getPaymentLabel(key: PaymentFeatureKey): string {
    return key === "upiEnabled" ? "UPI payments" : "Card payments";
  }

  function handleToggle<K extends keyof FeatureFlags>(key: K) {
    const currentlyEnabled = flags[key];

    if (!currentlyEnabled) {
      setPendingToggle({ kind: "global", key });
      return;
    }

    setFlags((current) => ({ ...current, [key]: !current[key] }));

    const label = getGlobalFeatureLabel(key);
    setFeatureAlert({
      title: `${label} disabled`,
      description:
        "This change is applied in the admin UI and can be wired to backend enforcement later.",
    });
  }

  function handleDepositChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(value)) return;
    setFlags((current) => ({ ...current, depositAmountInRupees: value }));
  }

  function handleUserOverrideToggle<K extends keyof UserOverrideFlags>(key: K) {
    if (!selectedUserId) return;

    const baseForUser: UserOverrideFlags =
      userOverrides[selectedUserId] ?? {
        walletEnabled: true,
        badgeRewardsEnabled: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
      };

    if (!baseForUser[key]) {
      setPendingToggle({
        kind: "override",
        key,
        userId: selectedUserId,
      });
      return;
    }

    setUserOverrides((previous) => {
      const currentForUser: UserOverrideFlags =
        previous[selectedUserId] ?? {
          walletEnabled: true,
          badgeRewardsEnabled: true,
          emailNotificationsEnabled: true,
          pushNotificationsEnabled: true,
        };

      const nextEnabled = !currentForUser[key];

      const nextForUser: UserOverrideFlags = {
        ...currentForUser,
        [key]: nextEnabled,
      };

      const label = getOverrideLabel(key);
      setFeatureAlert({
        title: `${label} ${nextEnabled ? "enabled" : "disabled"} for ${
          selectedUserId
        }`,
        description:
          "This per-user override is applied only in the admin UI for now and can later be enforced in your backend.",
      });

      return {
        ...previous,
        [selectedUserId]: nextForUser,
      };
    });
  }

  function handleSavePaymentConfig() {
    if (isSavingPaymentConfig) return;
    setIsSavingPaymentConfig(true);

    // Simulate async save to backend; replace with real API call later.
    window.setTimeout(() => {
      setIsSavingPaymentConfig(false);
    }, 1000);
  }

  function handleConfirmEnable() {
    if (!pendingToggle) return;

    if (pendingToggle.kind === "global") {
      const key = pendingToggle.key;
      setFlags((current) => ({ ...current, [key]: true }));

      const label = getGlobalFeatureLabel(key);
      setFeatureAlert({
        title: `${label} enabled`,
        description:
          "This change is applied in the admin UI and can be wired to backend enforcement later.",
      });
    } else if (pendingToggle.kind === "payment") {
      const key = pendingToggle.key;
      setPaymentConfig((current) => ({ ...current, [key]: true }));

      const label = getPaymentLabel(key);
      setFeatureAlert({
        title: `${label} enabled`,
        description:
          "Payment configuration is updated locally. Mirror this in your backend or gateway settings.",
      });
    } else if (pendingToggle.kind === "override") {
      const { key, userId } = pendingToggle;
      setUserOverrides((previous) => {
        const currentForUser =
          previous[userId] ?? {
            walletEnabled: true,
            badgeRewardsEnabled: true,
            emailNotificationsEnabled: true,
            pushNotificationsEnabled: true,
          };

        return {
          ...previous,
          [userId]: {
            ...currentForUser,
            [key]: true,
          },
        };
      });

      const label = getOverrideLabel(key);
      setFeatureAlert({
        title: `${label} enabled for ${pendingToggle.userId}`,
        description:
          "This per-user override is applied only in the admin UI for now and can later be enforced in your backend.",
      });
    }

    setPendingToggle(null);
  }

  function handleCancelEnable() {
    setPendingToggle(null);
  }

  const pendingLabel =
    pendingToggle?.kind === "global"
      ? getGlobalFeatureLabel(pendingToggle.key)
      : pendingToggle?.kind === "payment"
        ? getPaymentLabel(pendingToggle.key)
        : pendingToggle?.kind === "override"
          ? getOverrideLabel(pendingToggle.key)
          : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            System Configuration
          </h1>
          <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
            Toggle feature flags and key settings without needing a redeploy.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <article className="space-y-4 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-zinc-200 backdrop-blur-sm dark:bg-zinc-950/90 dark:ring-zinc-800">
            <div className="flex items-start gap-3">
              <div
                aria-hidden="true"
                className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <SwitchesIcon />
              </div>
              <div>
                <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  Feature flags
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  These are stored in-memory for now; wire to your backend or
                  remote config service for production.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-base">
              <ToggleFeatureCard
                icon={
                <WalletIcon />
                }
                title="Wallet enforcement"
                description="Require funded wallet for certain actions."
                active={flags.walletEnforcementEnabled}
                onClick={() => handleToggle("walletEnforcementEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <BadgeIcon />
                }
                title="Badge rewards"
                description="Enable awarding of new badges."
                active={flags.badgeRewardsEnabled}
                onClick={() => handleToggle("badgeRewardsEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <MaintenanceIcon />
                }
                title="Maintenance mode"
                description="Temporarily restrict user access during incidents."
                active={flags.maintenanceModeEnabled}
                activeLabel="On"
                inactiveLabel="Off"
                tone="danger"
                onClick={() => handleToggle("maintenanceModeEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <EmailIcon />
                }
                title="Email notifications"
                description="Account, session, and summary emails."
                active={flags.emailNotificationsEnabled}
                onClick={() => handleToggle("emailNotificationsEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <PushIcon />
                }
                title="Push notifications"
                description="Reminders and streak nudges across devices."
                active={flags.pushNotificationsEnabled}
                onClick={() => handleToggle("pushNotificationsEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <CoinsIcon />
                }
                title="Coins (in-app currency)"
                description="Enable earning and spending of coins."
                active={flags.coinsEnabled}
                onClick={() => handleToggle("coinsEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <SprintIcon />
                }
                title="Sprint mode"
                description="Short, intense focus sprints as an experiment."
                active={flags.sprintModeEnabled}
                onClick={() => handleToggle("sprintModeEnabled")}
              />
              <ToggleFeatureCard
                icon={
                <CelebrationIcon />
                }
                title="Avatar celebrations"
                description="Allow avatar celebration animations after sessions."
                active={flags.avatarCelebrationEnabled}
                onClick={() => handleToggle("avatarCelebrationEnabled")}
              />
            </div>
          </article>

          <article className="space-y-4 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-zinc-200 backdrop-blur-sm dark:bg-zinc-950/90 dark:ring-zinc-800">
            <div className="flex items-start gap-3">
              <div
                aria-hidden="true"
                className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
              >
                <RupeeConfigIcon />
              </div>
              <div>
                <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  Deposit configuration
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure the default deposit amount used in the product (₹200
                  by default).
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <label
                htmlFor="deposit-amount"
                className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Default deposit amount (₹)
              </label>
              <input
                id="deposit-amount"
                type="number"
                min={0}
                step={50}
                className="mt-1 block w-full max-w-xs rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                value={flags.depositAmountInRupees}
                onChange={handleDepositChange}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Reflect this value in your backend or environment config. This
                UI acts as a control panel, not the source of truth yet.
              </p>
            </div>
          </article>
        </section>

        <section className="space-y-4 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-zinc-200 backdrop-blur-sm dark:bg-zinc-950/90 dark:ring-zinc-800">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
            >
              <GatewayIcon />
            </div>
            <div>
              <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                Payment gateway configuration
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                View and tweak high-level payment settings. Sensitive
                credentials like API keys should live in server-side environment
                variables.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Provider
              </p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {paymentConfig.provider}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Currently integrated payment gateway.
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <label
                htmlFor="payment-mode"
                className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                Mode
              </label>
              <select
                id="payment-mode"
                value={paymentConfig.mode}
                onChange={(event) =>
                  setPaymentConfig((current) => ({
                    ...current,
                    mode: event.target.value as "test" | "live",
                  }))
                }
                className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
              >
                <option value="test">Test / sandbox</option>
                <option value="live">Live</option>
              </select>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Use test while integrating; switch to live for production.
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Currency
              </p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {paymentConfig.currency}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Base currency for deposits (configured in backend).
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <label
                htmlFor="payment-min-deposit"
                className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Minimum deposit (₹)
              </label>
              <input
                id="payment-min-deposit"
                type="number"
                min={0}
                step={50}
                className="mt-1 block w-full max-w-xs rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                value={paymentConfig.minDepositInRupees}
                onChange={(event) =>
                  setPaymentConfig((current) => ({
                    ...current,
                    minDepositInRupees: Number.parseInt(
                      event.target.value || "0",
                      10,
                    ),
                  }))
                }
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Lowest allowed deposit amount in the client UI.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <label
                htmlFor="payment-max-deposit"
                className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Maximum deposit (₹)
              </label>
              <input
                id="payment-max-deposit"
                type="number"
                min={0}
                step={100}
                className="mt-1 block w-full max-w-xs rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
                value={paymentConfig.maxDepositInRupees}
                onChange={(event) =>
                  setPaymentConfig((current) => ({
                    ...current,
                    maxDepositInRupees: Number.parseInt(
                      event.target.value || "0",
                      10,
                    ),
                  }))
                }
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Soft cap for how much a single deposit should be.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleFeatureCard
              icon={
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              }
              title="UPI enabled"
              description="Allow UPI as a payment method."
              active={paymentConfig.upiEnabled}
              onClick={() => {
                if (!paymentConfig.upiEnabled) {
                  setPendingToggle({ kind: "payment", key: "upiEnabled" });
                  return;
                }

                setPaymentConfig((current) => {
                  const nextEnabled = !current.upiEnabled;

                  setFeatureAlert({
                    title: `${getPaymentLabel("upiEnabled")} ${
                      nextEnabled ? "enabled" : "disabled"
                    }`,
                    description:
                      "Payment configuration is updated locally. Mirror this in your backend or gateway settings.",
                  });

                  return {
                    ...current,
                    upiEnabled: nextEnabled,
                  };
                });
              }}
            />
            <ToggleFeatureCard
              icon={
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500 dark:bg-sky-400" />
              }
              title="Cards enabled"
              description="Allow card payments via gateway."
              active={paymentConfig.cardsEnabled}
              onClick={() => {
                if (!paymentConfig.cardsEnabled) {
                  setPendingToggle({ kind: "payment", key: "cardsEnabled" });
                  return;
                }

                setPaymentConfig((current) => {
                  const nextEnabled = !current.cardsEnabled;

                  setFeatureAlert({
                    title: `${getPaymentLabel("cardsEnabled")} ${
                      nextEnabled ? "enabled" : "disabled"
                    }`,
                    description:
                      "Payment configuration is updated locally. Mirror this in your backend or gateway settings.",
                  });

                  return {
                    ...current,
                    cardsEnabled: nextEnabled,
                  };
                });
              }}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSavePaymentConfig}
              disabled={isSavingPaymentConfig}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSavingPaymentConfig ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent dark:border-zinc-700 dark:border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </section>
        <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
            >
              <UserOverridesIcon />
            </div>
            <div>
              <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                Per-user feature overrides
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Choose a user and toggle which features are active just for
                them. This is local to the admin UI for now and can later be
                wired to backend enforcement.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-base">
            <label
              htmlFor="user-select"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              Select user
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500"
            >
              {MOCK_ADMIN_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.id} — {user.phone}
                </option>
              ))}
            </select>
          </div>

          {selectedUserId ? (
            <div className="space-y-3 pt-2 text-base">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Overrides for{" "}
                <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
                  {selectedUserId}
                </span>
                .
              </p>
              {(() => {
                const current =
                  userOverrides[selectedUserId] ?? {
                    walletEnabled: true,
                    badgeRewardsEnabled: true,
                    emailNotificationsEnabled: true,
                    pushNotificationsEnabled: true,
                  };

                return (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUserOverrideToggle("walletEnabled")}
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                        >
                          <WalletIcon />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            Wallet features
                          </span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                            Deposits and wallet-based incentives for this user.
                          </span>
                        </span>
                      </span>
                      <span
                        className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          current.walletEnabled
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {current.walletEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUserOverrideToggle("badgeRewardsEnabled")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                        >
                          <BadgeIcon />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            Badge rewards
                          </span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                            Earning new badges and progress indicators.
                          </span>
                        </span>
                      </span>
                      <span
                        className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          current.badgeRewardsEnabled
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {current.badgeRewardsEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUserOverrideToggle("emailNotificationsEnabled")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                        >
                          <EmailIcon />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            Email notifications
                          </span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                            Session summaries and account emails for this user.
                          </span>
                        </span>
                      </span>
                      <span
                        className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          current.emailNotificationsEnabled
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {current.emailNotificationsEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUserOverrideToggle("pushNotificationsEnabled")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-left text-zinc-900 transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                        >
                          <PushIcon />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">
                            Push notifications
                          </span>
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                            Streak reminders and session nudges for this user.
                          </span>
                        </span>
                      </span>
                      <span
                        className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          current.pushNotificationsEnabled
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {current.pushNotificationsEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </button>
                  </>
                );
              })()}
            </div>
          ) : null}
        </section>
      </main>

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
              aria-label="Dismiss feature change alert"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {pendingToggle && pendingLabel ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-sm shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Enable {pendingLabel}?
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              This will enable{" "}
              {pendingLabel.toLowerCase()}{" "}
              {pendingToggle.kind === "override"
                ? `for user ${pendingToggle.userId}`
                : "in the admin configuration UI."}{" "}
              You can later wire this to backend enforcement.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEnable}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEnable}
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


