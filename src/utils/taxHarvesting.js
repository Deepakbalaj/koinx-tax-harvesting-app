export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function getNetAmount(bucket) {
  return bucket.profits - bucket.losses;
}

export function getRealisedGains(summary) {
  return getNetAmount(summary.stcg) + getNetAmount(summary.ltcg);
}

export function buildPostHarvestSummary(baseSummary, holdings, selectedAssets) {
  const selectedHoldings = holdings.filter((holding) => selectedAssets.has(holding.id));
  const nextSummary = structuredClone(baseSummary);

  selectedHoldings.forEach((holding) => {
    if (holding.stGain > 0) {
      nextSummary.stcg.profits += holding.stGain;
    } else if (holding.stGain < 0) {
      nextSummary.stcg.losses += Math.abs(holding.stGain);
    }

    if (holding.ltGain > 0) {
      nextSummary.ltcg.profits += holding.ltGain;
    } else if (holding.ltGain < 0) {
      nextSummary.ltcg.losses += Math.abs(holding.ltGain);
    }
  });

  return nextSummary;
}

export function calculateSavings(preSummary, postSummary) {
  return Math.max(0, getRealisedGains(preSummary) - getRealisedGains(postSummary));
}
