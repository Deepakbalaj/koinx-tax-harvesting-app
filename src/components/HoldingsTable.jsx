import { formatCurrency, formatNumber } from "../utils/taxHarvesting";

function GainCell({ value }) {
  const tone =
    value > 0
      ? "text-emerald-600 bg-emerald-50"
      : value < 0
        ? "text-rose-600 bg-rose-50"
        : "text-slate-500 bg-slate-100";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>
      {formatCurrency(value)}
    </span>
  );
}

export default function HoldingsTable({
  holdings,
  selectedAssets,
  allSelected,
  onToggleAsset,
  onToggleAll,
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100/80">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              <th className="px-4 py-4 sm:px-6">Asset</th>
              <th className="px-4 py-4 sm:px-6">Holdings</th>
              <th className="px-4 py-4 sm:px-6">Avg Buy Price</th>
              <th className="px-4 py-4 sm:px-6">Current Price</th>
              <th className="px-4 py-4 sm:px-6">ST Gain</th>
              <th className="px-4 py-4 sm:px-6">LT Gain</th>
              <th className="px-4 py-4 text-center sm:px-6">
                <label className="inline-flex cursor-pointer items-center gap-2 text-slate-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    checked={allSelected}
                    onChange={(event) => onToggleAll(event.target.checked)}
                  />
                  <span>Select</span>
                </label>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {holdings.map((holding) => {
              const selected = selectedAssets.has(holding.id);

              return (
                <tr
                  key={holding.id}
                  className={selected ? "bg-sky-50/70" : "bg-white"}
                >
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                        {holding.symbol}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{holding.asset}</p>
                        <p className="text-sm text-slate-500">{holding.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                    {formatNumber(holding.holdings)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                    {formatCurrency(holding.avgBuyPrice)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 sm:px-6">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <GainCell value={holding.stGain} />
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <GainCell value={holding.ltGain} />
                  </td>
                  <td className="px-4 py-4 text-center sm:px-6">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      checked={selected}
                      onChange={() => onToggleAsset(holding.id)}
                      aria-label={`Select ${holding.asset}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
