'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BadgeIcon, CategoryIcon, SwitchesIcon, LogsIcon, FinesIcon, OcrReviewIcon } from "@/components/icons";
import {
  AlertIcon,
  ClockIcon,
  TargetIcon,
  UsersIcon,
} from "@/components/icons/dashboard";
import { WalletIcon as WalletNavIcon } from "@/components/icons/wallet";

type NavItem = {
  label: string;
  href: string;
  section?: string;
  icon?: ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    section: "Overview",
    icon: <TargetIcon />,
  },
  { label: "Users", href: "/users", section: "Overview", icon: <UsersIcon /> },
  {
    label: "Sessions",
    href: "/analytics/sessions",
    section: "Analytics",
    icon: <ClockIcon />,
  },
  {
    label: "Subjects",
    href: "/analytics/subjects",
    section: "Analytics",
    icon: <CategoryIcon category="Study" />,
  },
  {
    label: "Admin analytics",
    href: "/analytics/admin",
    section: "Analytics",
    icon: <TargetIcon />,
  },
  {
    label: "Wallet",
    href: "/wallet",
    section: "Operations",
    icon: <WalletNavIcon />,
  },
  {
    label: "Fines",
    href: "/fines",
    section: "Operations",
    icon: <FinesIcon />,
  },
  // {
  //   label: "Matches",
  //   href: "/matches",
  //   section: "Operations",
  //   icon: <UsersIcon />,
  // },
  {
    label: "OCR Review",
    href: "/ocr",
    section: "Operations",
    icon: <OcrReviewIcon />,
  },
  {
    label: "Badges",
    href: "/badges",
    section: "Operations",
    icon: <BadgeIcon />,
  },
  {
    label: "Settings",
    href: "/settings",
    section: "System",
    icon: <SwitchesIcon />,
  },
  {
    label: "Logs",
    href: "/logs",
    section: "System",
    icon: <LogsIcon />,
  },
];

function groupBySection(items: NavItem[]): Array<{ section: string; items: NavItem[] }> {
  const groups = new Map<string, NavItem[]>();
  for (const item of items) {
    const key = item.section ?? "Main";
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return Array.from(groups.entries()).map(([section, groupItems]) => ({
    section,
    items: groupItems,
  }));
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/" || pathname.startsWith("/dashboard");
  }
  if (href === "/users") {
    return pathname.startsWith("/users");
  }
  if (href.startsWith("/analytics")) {
    return pathname.startsWith(href);
  }
  return pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const sections = groupBySection(navItems);

  useEffect(() => {
    const stored = window.localStorage.getItem("consistify-admin-theme");
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      setTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme: "light" | "dark" = prefersDark ? "dark" : "light";
    applyTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  function applyTheme(nextTheme: "light" | "dark") {
    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    window.localStorage.setItem("consistify-admin-theme", nextTheme);
  }

  function toggleTheme() {
    const nextTheme: "light" | "dark" = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function handleNavClick() {
    setMobileOpen(false);
  }

  const isLoginPage = pathname === "/login";

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white/80 px-3 py-4 text-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mb-4 flex items-center justify-between gap-2 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Consistify
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Admin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-1">
        {sections.map(({ section, items }) => (
          <div key={section} className="space-y-2">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
              {section}
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={handleNavClick}
                      className={[
                        "flex items-center rounded-lg px-2 py-1.5 text-xs font-medium transition",
                        active
                          ? "bg-zinc-900 text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon ? (
                          <span
                            aria-hidden="true"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
                          >
                            {item.icon}
                          </span>
                        ) : null}
                        <span>{item.label}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      {!isLoginPage ? <div className="hidden md:block">{sidebar}</div> : null}

      <div className="flex min-h-screen flex-1 flex-col">
        {!isLoginPage ? (
          <>
            <header className="flex items-center justify-between border-b border-zinc-200 bg-white/80 px-3 py-2 text-sm backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  Consistify
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Admin
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
                <form action="/api/admin/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Sign out
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setMobileOpen((open) => !open)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {mobileOpen ? "Close" : "Menu"}
                </button>
              </div>
            </header>

            {mobileOpen ? (
              <div className="border-b border-zinc-200 bg-white/95 px-2 pb-3 pt-2 text-sm shadow-sm md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
                {sidebar}
              </div>
            ) : null}
          </>
        ) : null}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}


