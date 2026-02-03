export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Consistify Admin
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          This app hosts the administrative tools for Consistify.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Use the{" "}
          <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
            /login
          </span>{" "}
          route to access the secure admin dashboard.
        </p>
      </div>
    </div>
  );
}
