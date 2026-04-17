import { capitalGainsResponse, holdingsResponse } from "../data/mockData";

function delay(payload, wait = 500) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(payload)), wait);
  });
}

export function fetchCapitalGains() {
  return delay(capitalGainsResponse, 600);
}

export function fetchHoldings() {
  return delay(holdingsResponse, 850);
}
