import { cutil } from "@ghasemkiani/base";
import { CoinGecko } from "./coingecko.js";

const iwcoingecko = {
  defPrices: {
    SIM: 0.004412905,
  },
  cgIds: {
    wmatic: "matic-network",
    id: "space-id",
  },
  _cg: null,
  get cg() {
    if (cutil.na(this._cg)) {
      this._cg = new CoinGecko({
        defIds: cutil.assign({}, CoinGecko.prototype.defIds, this.cgIds),
      });
    }
    return this._cg;
  },
  set cg(cg) {
    this._cg = cg;
  },
  _prices: null,
  get prices() {
    if (cutil.na(this._prices)) {
      this._prices = cutil.assign({}, this.defPrices);
    }
    return this._prices;
  },
  set prices(prices) {
    this._prices = prices;
  },
  resetPrices() {
    this.prices = null;
  },
  async toGetPrice(symbol) {
    if (!(symbol in this.prices)) {
      this.prices[symbol] = await this.cg.toGetPrice(symbol);
    }
    return this.prices[symbol];
  },
  async toGetPrices(symbols) {
    let syms = symbols.filter((symbol) => !(symbol in this.prices));
    if (syms.length > 0) {
      let prices = await this.cg.toGetPrices(syms);
      cutil.assign(this.prices, prices);
    }
    return symbols.reduce(
      (s, symbol) => ((s[symbol] = this.prices[symbol]), s),
      {},
    );
  },
};

export { iwcoingecko };
