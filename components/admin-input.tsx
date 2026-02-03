'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseFieldProps = {
  label: string;
  id: string;
  className?: string;
};

type AdminInputProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
    fullWidth?: boolean;
  };

export function AdminInput({
  label,
  id,
  fullWidth = true,
  className,
  ...props
}: AdminInputProps) {
  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={id}
        className={[
          "mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition",
          "hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </div>
  );
}

type AdminTextareaProps = BaseFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> & {
    fullWidth?: boolean;
  };

export function AdminTextarea({
  label,
  id,
  fullWidth = true,
  className,
  ...props
}: AdminTextareaProps) {
  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
      >
        {label}
      </label>
      <textarea
        id={id}
        className={[
          "mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none transition",
          "hover:bg-zinc-100 focus:border-zinc-400 focus:bg-white",
          "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-zinc-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </div>
  );
}


