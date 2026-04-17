import { formatCurrency } from "../utils/taxHarvesting";

export default function SavingsBanner({ preRealised, postRealised, savings }) {
  if (preRealised <= postRealised) {
    return null;
  }

  return (
    <section className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-[0_20px_50px_rgba(16,185,129,0.10)] sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
        Potential Savings
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-emerald-950 sm:text-xl">
        Harvesting these assets reduces realised gains by {formatCurrency(savings)}.
      </p>
      <p className="mt-1 text-sm text-emerald-800">
        Pre-harvesting realised gains: {formatCurrency(preRealised)}. After-harvesting realised
        gains: {formatCurrency(postRealised)}.
      </p>
    </section>
  );
}
