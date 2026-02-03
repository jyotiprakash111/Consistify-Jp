'use client';

import type { ButtonHTMLAttributes } from "react";

type AdminButtonVariant = "primary" | "outline" | "danger";
type AdminButtonSize = "sm" | "md";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  fullWidth?: boolean;
};

export function AdminButton({
  variant = "primary",
  size = "sm",
  fullWidth = false,
  className,
  children,
  ...props
}: AdminButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-70";

  const sizeClass =
    size === "md" ? "px-3 py-2" : "px-3 py-1.5";

  const variantClass =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      : variant === "danger"
        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/60"
        : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      className={[base, sizeClass, variantClass, widthClass, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}


