'use client';

import type { ReactNode } from "react";

type ToggleFeatureCardProps = {
  title: string;
  description?: string;
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  tone?: "default" | "danger";
  icon?: ReactNode;
  onClick: () => void;
};

export function ToggleFeatureCard({
  title,
  description,
  active,
  activeLabel = "Enabled",
  inactiveLabel = "Disabled",
  tone = "default",
  icon,
  onClick,
}: ToggleFeatureCardProps) {
  const pillClassNames =
    tone === "danger"
      ? active
        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      : active
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-left text-zinc-900 shadow-lg transition hover:border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-50 dark:hover:bg-zinc-900"
    >
      <span className="flex items-start gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
          >
            {icon}
          </span>
        ) : null}
        <span>
          <span className="block text-base font-medium">{title}</span>
          {description ? (
            <span className="block text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </span>
          ) : null}
        </span>
      </span>
      <span
        className={[
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-sm",
          pillClassNames,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {active ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}


