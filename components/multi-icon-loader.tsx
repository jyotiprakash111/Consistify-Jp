import type { ReactNode } from "react";

export type MultiIconLoaderProps = {
  title?: string;
  subtitle?: string;
  icons: Array<{ node: ReactNode; label: string }>;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function MultiIconLoader({
  title = "Loading",
  subtitle = "Fetching the latest admin data…",
  icons,
  size = "md",
  className,
}: MultiIconLoaderProps) {
  const sizeStyles = {
    sm: {
      container: "min-h-[40vh] gap-3",
      icon: "h-9 w-9 rounded-xl text-xs",
      title: "text-xs",
      subtitle: "text-[11px]",
    },
    md: {
      container: "min-h-[60vh] gap-4",
      icon: "h-12 w-12 rounded-2xl text-xs",
      title: "text-sm",
      subtitle: "text-xs",
    },
    lg: {
      container: "min-h-[70vh] gap-5",
      icon: "h-14 w-14 rounded-2xl text-sm",
      title: "text-base",
      subtitle: "text-sm",
    },
  }[size];

  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        sizeStyles.container,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        {icons.map((icon, index) => (
          <div
            key={icon.label}
            className={[
              "flex items-center justify-center border border-zinc-200 bg-white text-zinc-700 shadow-sm transition animate-bounce dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
              sizeStyles.icon,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <span className="sr-only">{icon.label}</span>
            <span className="animate-pulse">{icon.node}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <p
          className={[
            "font-semibold text-zinc-900 dark:text-zinc-50",
            sizeStyles.title,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </p>
        <p
          className={[
            "text-zinc-500 dark:text-zinc-400",
            sizeStyles.subtitle,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse"
            style={{ animationDelay: `${dot * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default MultiIconLoader;
