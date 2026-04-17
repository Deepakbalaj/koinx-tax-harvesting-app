export default function DashboardHeader() {
  return (
    <header className="rounded-[32px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:px-7 sm:py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-300">
            Tax Loss Harvesting
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
            Harvest smarter with a live capital gains simulator
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Compare pre-harvesting vs after-harvesting gains, review every holding, and instantly
            see whether a selected set of assets reduces realised gains.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Powered By</p>
            <p className="mt-2 text-lg font-medium">Mock Capital Gains API</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Interface</p>
            <p className="mt-2 text-lg font-medium">React + Tailwind</p>
          </div>
        </div>
      </div>
    </header>
  );
}
