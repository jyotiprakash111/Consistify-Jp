type TrendDirection = "up" | "down" | "flat";
import {
  AlertIcon,
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  TargetIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons/dashboard";

type Metric = {
  label: string;
  value: string;
  helper?: string;
  icon: React.ReactNode;
  trend?: {
    direction: TrendDirection;
    delta: string;
  };
};

const metrics: Metric[] = [
  {
    label: "Total users",
    value: "12,480",
    helper: "Registered accounts",
    icon: <UsersIcon />,
    trend: { direction: "up", delta: "+3.1% vs yesterday" },
  },
  {
    label: "Active today",
    value: "1,024",
    helper: "DAU (last 24h)",
    icon: <BoltIcon />,
    trend: { direction: "up", delta: "+1.8% vs yesterday" },
  },
  {
    label: "Focus sessions (today)",
    value: "3,842",
    helper: "Completed sessions",
    icon: <TargetIcon />,
    trend: { direction: "up", delta: "+5.4% vs yesterday" },
  },
  {
    label: "Focus sessions (this week)",
    value: "21,309",
    helper: "Completed sessions",
    icon: <CalendarIcon />,
    trend: { direction: "up", delta: "+12.7% vs last week" },
  },
  {
    label: "Total focus time",
    value: "8,320 h",
    helper: "Aggregate across all users",
    icon: <ClockIcon />,
    trend: { direction: "up", delta: "+4.2% vs yesterday" },
  },
  {
    label: "Wallet balance (total deposits)",
    value: "₹42,360",
    helper: "Gross deposits collected",
    icon: <WalletIcon />,
    trend: { direction: "up", delta: "+2.6% vs yesterday" },
  },
  {
    label: "Failed / incomplete sessions",
    value: "183",
    helper: "Last 24h",
    icon: <AlertIcon />,
    trend: { direction: "down", delta: "-0.9% vs yesterday" },
  },
];

function TrendChip({ trend }: { trend?: Metric["trend"] }) {
  if (!trend) return null;

  const isUp = trend.direction === "up";
  const isDown = trend.direction === "down";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm",
        isUp && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        isDown && "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
        !isUp &&
          !isDown &&
          "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden="true">
        {isUp ? "↑" : isDown ? "↓" : "•"}
      </span>
      <span>{trend.delta}</span>
    </span>
  );
}

function UserActivityPie() {
  const totalUsers = 12480;
  const activeUsers = 1024;
  const inactiveUsers = totalUsers - activeUsers;

  const activePercent = (activeUsers / totalUsers) * 100;

  return (
    <div className="mt-4 flex items-center gap-4">
      <svg
        viewBox="0 0 32 32"
        className="h-24 w-24 text-red-500 dark:text-zinc-900"
        aria-hidden="true"
      >
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-emerald-500 dark:text-emerald-400"
          strokeDasharray={`${activePercent} ${100 - activePercent}`}
          strokeDashoffset="25"
          transform="rotate(-90 16 16)"
        />
      </svg>
      <div className="space-y-1 text-xs">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          Daily activity
        </p>
        <p className="text-zinc-500 dark:text-zinc-400">
          {activeUsers.toLocaleString()} active users today
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-zinc-600 dark:text-zinc-300">
              Active ({Math.round(activePercent)}%)
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-200 dark:bg-zinc-800" />
            <span className="text-red-600 dark:text-zinc-300">
              Not active today ({inactiveUsers.toLocaleString()})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 pb-10 pt-6 dark:bg-black">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 pb-6">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            High-level overview of Consistify usage and revenue.
          </p>
        </div>
        <form
          action="/api/admin/logout"
          method="post"
          className="flex items-center gap-3"
        >
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {metric.icon}
                  </div>
                  <div>
                    <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {metric.label}
                    </h2>
                    {metric.helper ? (
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        {metric.helper}
                      </p>
                    ) : null}
                  </div>
                </div>
                <TrendChip trend={metric.trend} />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {metric.value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Engagement snapshot
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Quick view of how users are interacting with focus sessions.
            </p>
            <UserActivityPie />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Reliability
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              System health across the last 7 days – uptime, failures, and recent
              incidents.
            </p>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">
                    Uptime (last 7 days)
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-300">
                    99.3%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div className="h-full w-[99.3%] rounded-full bg-emerald-500 dark:bg-emerald-400" />
                </div>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                <span>Failed / incomplete sessions</span>
                <span className="font-medium text-amber-700 dark:text-amber-300">
                  0.7% of started
                </span>
              </div>

              <div className="space-y-1 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Recent incident
                </p>
                <p className="text-xs text-zinc-700 dark:text-zinc-200">
                  Short spike in payment failures detected and auto-resolved.
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  2026-01-05 • 3m impact • no user refunds required
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


