/* Shared quote calculations. Prices are rounded before deriving displayed changes. */
export function quoteValues(price, previousClose) {
  if (!Number.isFinite(price) || !Number.isFinite(previousClose) || price <= 0 || previousClose <= 0) {
    throw new RangeError('Quotes require positive prices and previous closes.');
  }
  const last = Math.round(price * 100) / 100;
  const close = Math.round(previousClose * 100) / 100;
  if (!last || !close) throw new RangeError('Prices must be at least 0.01.');
  const change = Math.round((last - close) * 100) / 100;
  const percent = Math.round(change / close * 10000) / 100;
  return {price:last, previousClose:close, change, percent, direction:change > 0 ? 'gain' : change < 0 ? 'loss' : 'flat'};
}
