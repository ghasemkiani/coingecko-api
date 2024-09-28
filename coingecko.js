import { CoinGeckoClient } from "coingecko-api-v3";

import { cutil } from "@ghasemkiani/base";
import { Obj } from "@ghasemkiani/base";
import { Axis } from "@ghasemkiani/base-utils";

class CoinGecko extends Obj {
  static {
    cutil.extend(this.prototype, {
      defIds: {
        sand: "the-sandbox",
        shr: "sharering",
        cake: "pancakeswap-token",
        chz: "chiliz",
        toncoin: "telegram-open-network",
        rune: "thorchain",
        // "luna": "terra-luna",
        bull: "3x-long-bitcoin-token",
        bear: "3x-short-bitcoin-token",
        ethbull: "3x-long-ethereum-token",
        ethbear: "3x-short-ethereum-token",
        eosbull: "3x-long-eos-token",
        eosbear: "3x-short-eos-token",
        xrpbull: "3x-long-xrp-token",
        xrpbear: "3x-short-xrp-token",
        vrab: "verasity",
        und: "unification",
        kp3rb: "keep3rv1",
        bopen: "open-governance-token",
        pizza: "pizzaswap",
        bttold: "bittorrent-old",
        ust_: "wrapped-ust",
        ust: "terrausd-wormhole",
        ustc: "terrausd",

        arb: "arbitrum",
        busd: "binance-usd",
        btc: "bitcoin",
        eth: "ethereum",
        bnb: "binancecoin",
        crv: "curve-dao-token",
        matic: "matic-network",
        avax: "avalanche-2",
        ftm: "fantom",
        ada: "cardano",
        dot: "polkadot",
        link: "chainlink",
        atom: "cosmos",
        lunc: "terra-luna",
        luna_: "terra-luna",
        luna: "terra-luna-2",
        sol: "solana",
        steem: "steem",
        sbd: "steem-dollars",
        trx: "tron",
        btt: "bittorrent",
        doge: "dogecoin",
        xrp: "ripple",
        ltc: "litecoin",
        bch: "bitcoin-cash",
        ftt: "ftx-token",
        toncoin: "the-open-network",
      },
      _apiKey: null,
      _ids: null,
      coinList: null,
      coinData: null,
      _client: null,
      timeout: 10000,
      autoRetry: true,
    });
  }
  get apiKey() {
    if (cutil.na(this._apiKey) && cutil.a(process.env.COINGECKO_APIKEY)) {
      this._apiKey = process.env.COINGECKO_APIKEY;
    }
    return this._apiKey;
  }
  set apiKey(apiKey) {
    this._apiKey = apiKey;
  }
  get ids() {
    if (!this._ids) {
      this._ids = cutil.assign({}, this.defIds);
    }
    return this._ids;
  }
  set ids(ids) {
    this._ids = ids;
  }
  getId(symbol) {
    symbol = cutil.asString(symbol).toLowerCase();
    symbol = symbol.replace(/^wh_/i, "");
    return this.ids[symbol] || symbol;
  }
  setId(symbol, id) {
    symbol = cutil.asString(symbol).toLowerCase();
    this.ids[symbol] = id;
  }
  hasId(symbol) {
    symbol = cutil.asString(symbol).toLowerCase();
    return symbol in this.ids;
  }
  get client() {
    if (!this._client) {
      let { timeout, autoRetry, apiKey } = this;
      this._client = new CoinGeckoClient({ timeout, autoRetry } /* , apiKey */);
      // this._client.apiKey = apiKey;
    }
    return this._client;
  }
  set client(client) {
    this._client = client;
  }
  async toGetIds() {
    if (!this.coinList) {
      this.coinList = await this.client.coinList({
        x_cg_demo_api_key: this.apiKey,
      });
      for (let { id, symbol } of this.coinList) {
        if (!this.hasId(symbol)) {
          this.setId(symbol, id);
        }
      }
      this.coinData = this.coinList.reduce(
        (map, item) => ((map[item.id] = item), map),
        {},
      );
    }
  }
  async toUpdate(force = false) {
    if (force) {
      this.coinList = null;
    }
    await this.toGetIds();
  }
  dontUpdate() {
    this.coinList ||= [];
    this.coinData ||= {};
    return this;
  }
  async toReset() {
    this.coinList = null;
    this.coinData = null;
    this.ids = null;
    await this.toUpdate();
  }
  async toGetPrice(symbol) {
    await this.toGetIds();
    let id = this.getId(symbol);
    let vs_currencies = "usd";
    let ids = id;
    let result = await this.client.simplePrice({
      vs_currencies,
      ids,
      x_cg_demo_api_key: this.apiKey,
    });
    let price = result?.[id]?.usd;
    if (cutil.isNil(price)) {
      throw new Error(`Could not get price for '${symbol}'`);
    }
    return price;
  }
  async toGetPrices(symbols) {
    await this.toGetIds();
    let mapIdSymbol = symbols.reduce(
      (map, symbol) => ((map[this.getId(symbol)] = symbol), map),
      {},
    );
    let vs_currencies = "usd";
    let ids = Object.keys(mapIdSymbol).join(",");
    let result = await this.client.simplePrice({
      vs_currencies,
      ids,
      x_cg_demo_api_key: this.apiKey,
    });
    let prices = Object.keys(mapIdSymbol).reduce(
      (map, id) => ((map[mapIdSymbol[id]] = result[id]?.usd || 0), map),
      {},
    );
    return prices;
  }
  async toGetPriceAxis(symbol, fromDate, toDate) {
    await this.toGetIds();
    let id = this.getId(symbol);
    let vs_currency = "usd";
    let from = cutil.asInteger(new Date(fromDate).getTime() / 1000);
    let to = cutil.asInteger(new Date(toDate).getTime() / 1000);
    let { prices: data } = await this.client.coinIdMarketChartRange({
      id,
      vs_currency,
      from,
      to,
      x_cg_demo_api_key: this.apiKey,
    });
    let axis = new Axis({ data });
    axis.sort();
    return axis;
  }
}

export { CoinGecko };
