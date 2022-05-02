import {CoinGeckoClient} from "coingecko-api-v3";

import {cutil} from "@ghasemkiani/base";
import {Obj} from "@ghasemkiani/base";

class CoinGecko extends Obj {
	get ids() {
		if (!this._ids) {
			this._ids = {};
			cutil.assign(this._ids, this.defIds);
		}
		return this._ids;
	}
	set ids(ids) {
		this._ids = ids;
	}
	getId(symbol) {
		symbol = cutil.asString(symbol).toLowerCase();
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
			let {timeout, autoRetry} = this;
			this._client = new CoinGeckoClient({timeout, autoRetry});
		}
		return this._client;
	}
	set client(client) {
		this._client = client;
	}
	async toGetIds() {
		if (!this.coinList) {
			this.coinList = await this.client.coinList();
			for (let {id, symbol} of this.coinList) {
				if (!this.hasId(symbol)) {
					this.setId(symbol, id);
				}
			}
			this.coinData = this.coinList.reduce((map, item) => (map[item.id] = item, map), {});
		}
	}
	async toGetPrice(symbol) {
		await this.toGetIds();
		let id = this.getId(symbol);
		let vs_currencies = "usd";
		let ids = id;
		let result = await this.client.simplePrice({vs_currencies, ids});
		let price = result[id].usd;
		return price;
	}
	async toGetPrices(symbols) {
		await this.toGetIds();
		let mapIdSymbol = symbols.reduce((map, symbol) => (map[this.getId(symbol)] = symbol, map), {});
		let vs_currencies = "usd";
		let ids = Object.keys(mapIdSymbol).join(",");
		let result = await this.client.simplePrice({vs_currencies, ids});
		let prices = Object.keys(mapIdSymbol).reduce((map, id) => (map[mapIdSymbol[id]] = result[id].usd, map), {});
		return prices;
	}
}
cutil.extend(CoinGecko.prototype, {
	defIds: {
		"shr": "sharering",
	},
	_ids: null,
	coinList: null,
	coinData: null,
	_client: null,
	timeout: 10000,
	autoRetry: true,
});

export {CoinGecko};
