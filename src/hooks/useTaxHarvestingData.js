import { useEffect, useState } from "react";
import { fetchCapitalGains, fetchHoldings } from "../api/mockApi";

export default function useTaxHarvestingData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [capitalGains, setCapitalGains] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [capitalGainsResult, holdingsResult] = await Promise.all([
          fetchCapitalGains(),
          fetchHoldings(),
        ]);

        if (!mounted) {
          return;
        }

        setCapitalGains(capitalGainsResult.capitalGains);
        setHoldings(holdingsResult.holdings);
        setError("");
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load tax data.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  function toggleAssetSelection(assetId) {
    setSelectedAssets((current) => {
      const next = new Set(current);

      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }

      return next;
    });
  }

  function toggleAllAssets(checked) {
    setSelectedAssets(checked ? new Set(holdings.map((holding) => holding.id)) : new Set());
  }

  return {
    loading,
    error,
    capitalGains,
    holdings,
    selectedAssets,
    toggleAssetSelection,
    toggleAllAssets,
  };
}
