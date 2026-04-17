export default function ErrorState({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.20)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Error</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Unable to load tax data
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {message || "Something went wrong while loading the mock APIs."}
        </p>
      </div>
    </div>
  );
}
