import { formatCurrency, getNetAmount } from "../utils/taxHarvesting";

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-right ${strong ? "text-base font-semibold text-slate-950" : "text-sm font-medium text-slate-700"}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function GainGroup({ title, bucket }) {
  const net = getNetAmount(bucket);
  const tone =
    net > 0
      ? "text-emerald-700 bg-emerald-50"
      : net < 0
        ? "text-rose-700 bg-rose-50"
        : "text-slate-600 bg-slate-100";

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
          Net {formatCurrency(net)}
        </span>
      </div>
      <SummaryRow label="Profits" value={bucket.profits} />
      <SummaryRow label="Losses" value={bucket.losses} />
      <SummaryRow label="Net" value={net} strong />
    </div>
  );
}

export default function TaxSummaryCard({ title, subtitle, summary, accent, realised }) {
  const theme =
    accent === "sky"
      ? "border-sky-200 bg-[linear-gradient(180deg,_rgba(14,165,233,0.10),_rgba(255,255,255,0.92))]"
      : "border-slate-200 bg-[linear-gradient(180deg,_rgba(15,23,42,0.05),_rgba(255,255,255,0.92))]";

  return (
    <article className={`rounded-[28px] border p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6 ${theme}`}>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">{title}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <GainGroup title="STCG" bucket={summary.stcg} />
        <GainGroup title="LTCG" bucket={summary.ltcg} />
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-950 px-4 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
          Realised Gains
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{formatCurrency(realised)}</p>
      </div>
    </article>
  );
}
