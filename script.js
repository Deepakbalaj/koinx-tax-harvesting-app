const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const preciseCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const elements = {
  fySelect: document.querySelector("#fy-select"),
  heroMetrics: document.querySelector("#hero-metrics"),
  summaryGrid: document.querySelector("#summary-grid"),
  impactMessage: document.querySelector("#impact-message"),
  impactStats: document.querySelector("#impact-stats"),
  coinsList: document.querySelector("#coins-list"),
  sidebarStats: document.querySelector("#sidebar-stats"),
  termFilter: document.querySelector("#term-filter"),
};

const state = {
  dataset: null,
  yearId: null,
  filter: "all",
  selectedLosses: new Set(),
};

function calculateCoinMetrics(coin) {
  const invested = coin.quantity * coin.buyPrice;
  const currentValue = coin.quantity * coin.currentPrice;
  const pnl = currentValue - invested;

  return {
    ...coin,
    invested,
    currentValue,
    pnl,
    absoluteLoss: pnl < 0 ? Math.abs(pnl) : 0,
    isHarvestable: pnl < 0,
  };
}

function getActiveYear() {
  return state.dataset.financialYears.find((year) => year.id === state.yearId);
}

function getYearMetrics(year) {
  const coins = year.coins.map(calculateCoinMetrics);
  const selectedCoins = coins.filter((coin) => state.selectedLosses.has(coin.id));

  const harvestedShortLoss = selectedCoins
    .filter((coin) => coin.term === "short")
    .reduce((sum, coin) => sum + coin.absoluteLoss, 0);
  const harvestedLongLoss = selectedCoins
    .filter((coin) => coin.term === "long")
    .reduce((sum, coin) => sum + coin.absoluteLoss, 0);

  const availableShortLoss = coins
    .filter((coin) => coin.term === "short" && coin.isHarvestable)
    .reduce((sum, coin) => sum + coin.absoluteLoss, 0);
  const availableLongLoss = coins
    .filter((coin) => coin.term === "long" && coin.isHarvestable)
    .reduce((sum, coin) => sum + coin.absoluteLoss, 0);

  const shortGainBefore = year.capitalGains.short;
  const longGainBefore = year.capitalGains.long;
  const shortGainAfter = Math.max(0, shortGainBefore - harvestedShortLoss);
  const longGainAfter = Math.max(0, longGainBefore - harvestedLongLoss);

  const shortTaxBefore = shortGainBefore * year.taxRates.short;
  const longTaxBefore = longGainBefore * year.taxRates.long;
  const shortTaxAfter = shortGainAfter * year.taxRates.short;
  const longTaxAfter = longGainAfter * year.taxRates.long;

  return {
    coins,
    selectedCoins,
    harvestedShortLoss,
    harvestedLongLoss,
    availableShortLoss,
    availableLongLoss,
    shortGainBefore,
    longGainBefore,
    shortGainAfter,
    longGainAfter,
    totalTaxBefore: shortTaxBefore + longTaxBefore,
    totalTaxAfter: shortTaxAfter + longTaxAfter,
    taxSaved: shortTaxBefore + longTaxBefore - shortTaxAfter - longTaxAfter,
    totalHarvestedLoss: harvestedShortLoss + harvestedLongLoss,
  };
}

function formatCurrency(value, precise = false) {
  return (precise ? preciseCurrency : currency).format(value);
}

function getPnlClass(value) {
  if (value < 0) {
    return "is-loss";
  }

  if (value > 0) {
    return "is-profit";
  }

  return "";
}

function renderHero(year, metrics) {
  const harvestableCoins = metrics.coins.filter((coin) => coin.isHarvestable).length;
  const totalPortfolioValue = metrics.coins.reduce((sum, coin) => sum + coin.currentValue, 0);

  elements.heroMetrics.innerHTML = [
    `${harvestableCoins} harvestable positions`,
    `${formatCurrency(totalPortfolioValue)} portfolio tracked`,
    `${formatCurrency(metrics.taxSaved)} estimated savings`,
  ]
    .map((text) => `<span class="metric-chip">${text}</span>`)
    .join("");
}

function renderSummary(year, metrics) {
  const cards = [
    {
      label: "Short-term gains",
      value: metrics.shortGainBefore,
      className: "is-profit",
      note: `Taxed at ${(year.taxRates.short * 100).toFixed(0)}%`,
    },
    {
      label: "Long-term gains",
      value: metrics.longGainBefore,
      className: "is-profit",
      note: `Taxed at ${(year.taxRates.long * 100).toFixed(0)}%`,
    },
    {
      label: "Harvestable short-term losses",
      value: metrics.availableShortLoss,
      className: "is-loss",
      note: `${metrics.coins.filter((coin) => coin.term === "short" && coin.isHarvestable).length} positions available`,
    },
    {
      label: "Harvestable long-term losses",
      value: metrics.availableLongLoss,
      className: "is-loss",
      note: `${metrics.coins.filter((coin) => coin.term === "long" && coin.isHarvestable).length} positions available`,
    },
  ];

  elements.summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <p class="label">${card.label}</p>
          <strong class="summary-value ${card.className}">${formatCurrency(card.value)}</strong>
          <p>${card.note}</p>
        </article>
      `
    )
    .join("");
}

function renderImpact(year, metrics) {
  const message = metrics.totalHarvestedLoss
    ? `You have selected ${metrics.selectedCoins.length} loss-making position${metrics.selectedCoins.length > 1 ? "s" : ""}. This could reduce taxable gains from ${formatCurrency(metrics.shortGainBefore + metrics.longGainBefore)} to ${formatCurrency(metrics.shortGainAfter + metrics.longGainAfter)}.`
    : `Choose the loss-making assets you want to harvest. The calculator will immediately show the impact on your ${year.label} gains.`;

  elements.impactMessage.textContent = message;

  const stats = [
    {
      label: "Estimated tax before",
      value: metrics.totalTaxBefore,
      className: "",
    },
    {
      label: "Estimated tax after",
      value: metrics.totalTaxAfter,
      className: "",
    },
    {
      label: "Losses selected",
      value: metrics.totalHarvestedLoss,
      className: "is-loss",
    },
    {
      label: "Tax saved",
      value: metrics.taxSaved,
      className: metrics.taxSaved > 0 ? "is-profit" : "",
    },
  ];

  elements.impactStats.innerHTML = stats
    .map(
      (stat) => `
        <article class="impact-stat">
          <span class="value-label">${stat.label}</span>
          <strong class="${stat.className}">${formatCurrency(stat.value)}</strong>
        </article>
      `
    )
    .join("");
}

function renderSidebar(metrics) {
  const stats = [
    {
      label: "Harvested positions",
      value: `${metrics.selectedCoins.length}`,
    },
    {
      label: "Losses offsetting gains",
      value: formatCurrency(metrics.totalHarvestedLoss),
    },
    {
      label: "Net taxable gain",
      value: formatCurrency(metrics.shortGainAfter + metrics.longGainAfter),
    },
  ];

  elements.sidebarStats.innerHTML = stats
    .map(
      (stat) => `
        <div class="sidebar-stat">
          <span class="mini-label">${stat.label}</span>
          <strong>${stat.value}</strong>
        </div>
      `
    )
    .join("");
}

function renderCoins(metrics) {
  const visibleCoins = metrics.coins.filter((coin) => state.filter === "all" || coin.term === state.filter);

  if (!visibleCoins.length) {
    elements.coinsList.innerHTML = '<div class="empty-state">No positions match the current filter.</div>';
    return;
  }

  elements.coinsList.innerHTML = visibleCoins
    .map((coin) => {
      const selected = state.selectedLosses.has(coin.id);
      const buttonLabel = selected ? "Included in harvest" : coin.isHarvestable ? "Add to harvest" : "No loss to harvest";

      return `
        <article class="coin-card ${coin.isHarvestable ? "" : "is-disabled"}">
          <div class="coin-top">
            <div class="coin-identity">
              <div class="coin-badge" style="background:${coin.color}">${coin.symbol.slice(0, 1)}</div>
              <div>
                <div class="coin-name-line">
                  <h3>${coin.name}</h3>
                  <span class="coin-symbol">${coin.symbol}</span>
                  <span class="term-chip ${coin.term}">${coin.term === "short" ? "Short-term" : "Long-term"}</span>
                  <span class="tax-chip ${coin.isHarvestable ? "harvestable" : "locked"}">${coin.isHarvestable ? "Harvestable" : "In profit"}</span>
                </div>
                <p class="coin-note">${coin.lastTrade}</p>
              </div>
            </div>
            <button
              class="coin-toggle ${selected ? "is-selected" : ""}"
              type="button"
              data-coin-id="${coin.id}"
              ${coin.isHarvestable ? "" : "disabled"}
            >
              ${buttonLabel}
            </button>
          </div>
          <div class="coin-values">
            <div class="coin-value">
              <span class="value-label">Holdings</span>
              <strong class="value-number">${coin.quantity} ${coin.symbol}</strong>
            </div>
            <div class="coin-value">
              <span class="value-label">Current value</span>
              <strong class="value-number">${formatCurrency(coin.currentValue)}</strong>
            </div>
            <div class="coin-value">
              <span class="value-label">Cost basis</span>
              <strong class="value-number">${formatCurrency(coin.invested)}</strong>
            </div>
            <div class="coin-value">
              <span class="value-label">Unrealised P&L</span>
              <strong class="value-number ${getPnlClass(coin.pnl)}">${formatCurrency(coin.pnl, true)}</strong>
            </div>
          </div>
          <div class="coin-footer">
            <div class="coin-tags">
              <span class="metric-chip">Buy ${formatCurrency(coin.buyPrice, true)}</span>
              <span class="metric-chip">Now ${formatCurrency(coin.currentPrice, true)}</span>
            </div>
            <span class="coin-meta">${coin.isHarvestable ? `Potential offset ${formatCurrency(coin.absoluteLoss)}` : "Kept for portfolio context"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function syncSelectionWithYear(year) {
  const validIds = new Set(year.coins.map((coin) => coin.id));
  state.selectedLosses = new Set([...state.selectedLosses].filter((id) => validIds.has(id)));
}

function populateYearSelect() {
  elements.fySelect.innerHTML = state.dataset.financialYears
    .map((year) => `<option value="${year.id}">${year.label}</option>`)
    .join("");
  elements.fySelect.value = state.yearId;
}

function render() {
  const year = getActiveYear();
  const metrics = getYearMetrics(year);

  renderHero(year, metrics);
  renderSummary(year, metrics);
  renderImpact(year, metrics);
  renderCoins(metrics);
  renderSidebar(metrics);
}

async function loadData() {
  const response = await fetch("/data/tax-harvesting.json");

  if (!response.ok) {
    throw new Error("Unable to load mock portfolio data.");
  }

  return response.json();
}

function attachEvents() {
  elements.fySelect.addEventListener("change", (event) => {
    state.yearId = event.target.value;
    syncSelectionWithYear(getActiveYear());
    render();
  });

  elements.termFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");

    if (!button) {
      return;
    }

    state.filter = button.dataset.filter;
    elements.termFilter.querySelectorAll("button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    render();
  });

  elements.coinsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-coin-id]");

    if (!button || button.disabled) {
      return;
    }

    const { coinId } = button.dataset;

    if (state.selectedLosses.has(coinId)) {
      state.selectedLosses.delete(coinId);
    } else {
      state.selectedLosses.add(coinId);
    }

    render();
  });
}

async function init() {
  try {
    state.dataset = await loadData();
    state.yearId = state.dataset.financialYears[0].id;
    populateYearSelect();
    attachEvents();
    render();
  } catch (error) {
    elements.summaryGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
    elements.coinsList.innerHTML = "";
  }
}

init();
