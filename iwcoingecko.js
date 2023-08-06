import {cutil} from "@ghasemkiani/base";
import {CoinGecko} from "./coingecko.js";

const iwcoingecko = {
	defPrices: {
		"SIM": 0.001,
	},
	cgIds: {
		"wmatic": "matic-network",
		"id": "space-id",
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
};

export {iwcoingecko};
