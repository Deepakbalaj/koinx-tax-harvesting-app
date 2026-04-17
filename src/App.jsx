import DashboardHeader from "./components/DashboardHeader";
import ErrorState from "./components/ErrorState";
import HoldingsTable from "./components/HoldingsTable";
import LoadingState from "./components/LoadingState";
import SavingsBanner from "./components/SavingsBanner";
import TaxSummaryCard from "./components/TaxSummaryCard";
import useTaxHarvestingData from "./hooks/useTaxHarvestingData";
import {
  buildPostHarvestSummary,
  calculateSavings,
  getRealisedGains,
} from "./utils/taxHarvesting";

export default function App() {
  const {
    loading,
    error,
    capitalGains,
    holdings,
    selectedAssets,
    toggleAssetSelection,
    toggleAllAssets,
  } = useTaxHarvestingData();

  if (loading) {
    return <LoadingState />;
  }

  if (error || !capitalGains) {
    return <ErrorState message={error} />;
  }

  const postHarvestSummary = buildPostHarvestSummary(capitalGains, holdings, selectedAssets);
  const preRealised = getRealisedGains(capitalGains);
  const postRealised = getRealisedGains(postHarvestSummary);
  const savings = calculateSavings(capitalGains, postHarvestSummary);
  const allSelected = holdings.length > 0 && selectedAssets.size === holdings.length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.16),_transparent_20%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader />

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <TaxSummaryCard
            title="Pre-Harvesting"
            subtitle="Current realised gains before selecting assets to harvest."
            summary={capitalGains}
            accent="slate"
            realised={preRealised}
          />
          <TaxSummaryCard
            title="After-Harvesting"
            subtitle="Live summary that updates as assets are selected below."
            summary={postHarvestSummary}
            accent="sky"
            realised={postRealised}
          />
        </section>

        <SavingsBanner preRealised={preRealised} postRealised={postRealised} savings={savings} />

        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                Holdings API
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Select assets to simulate harvesting
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Positive gains are added to profits, while negative gains are added to losses for
                short-term and long-term buckets independently.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{selectedAssets.size}</span> of{" "}
              <span className="font-semibold text-slate-900">{holdings.length}</span> assets selected
            </div>
          </div>

          <HoldingsTable
            holdings={holdings}
            selectedAssets={selectedAssets}
            allSelected={allSelected}
            onToggleAsset={toggleAssetSelection}
            onToggleAll={toggleAllAssets}
          />
        </section>
      </div>
    </div>
  );
}
