import { cutil } from "@ghasemkiani/base";
import { iwcoingecko } from "./iwcoingecko.js";

const iwcoingeckoApp = cutil.extend(iwcoingecko, {
  _defPrices: iwcoingecko.defPrices,
  get defPrices() {
    return cutil.extend({}, this._defPrices, this?.prefs?.defPrices);
  },
  set defPrices(defPrices) {
    this._defPrices = defPrices;
  },
  _cgIds: iwcoingecko.cgIds,
  get cgIds() {
    return cutil.extend({}, this._cgIds, this?.prefs?.cgIds);
  },
  set cgIds(cgIds) {
    this._cgIds = cgIds;
  },
  async toDefineInitOptionsIWCoingeckoApp() {
    let app = this;
    app.commander.option("--price <symbolAndPrice>", "Set price for symbol");
    app.commander.option(
      "--set-price <symbolAndPrice>",
      "Set price for symbol persistently",
    );
    app.commander.option(
      "--del-price <symbol>",
      "Remove price for symbol persistently",
    );
    app.commander.option("--cg-id <symbolAndCgId>", "Set cgId for symbol");
    app.commander.option(
      "--set-cg-id <symbolAndCgId>",
      "Set cgId for symbol persistently",
    );
    app.commander.option(
      "--del-cg-id <symbol>",
      "Remove cgId for symbol persistently",
    );
  },
  async toApplyInitOptionsIWCoingeckoApp() {
    let app = this;
    let { prefs } = app;
    let opts = app.commander.opts();
    if (cutil.a(opts.price)) {
      app._defPrices = {
        ...cutil.asObject(app._defPrices),
        ...Object.fromEntries(
          cutil
            .asString(opts.price)
            .split(",")
            .map((part) => part.split("="))
            .map(([symbol, price]) => [symbol, cutil.asNumber(price)]),
        ),
      };
    }
    if (cutil.a(opts.setPrice)) {
      app.prefs.defPrices = {
        ...cutil.asObject(app.prefs.defPrices),
        ...Object.fromEntries(
          cutil
            .asString(opts.setPrice)
            .split(",")
            .map((part) => part.split("="))
            .map(([symbol, price]) => [symbol, cutil.asNumber(price)]),
        ),
      };
      app.prefs.save();
    }
    if (cutil.a(opts.delPrice)) {
      let symbols = cutil.asString(opts.delPrice).split(",");
      for (let symbol of symbols) {
        delete app.prefs.defPrices[symbol];
      }
      app.prefs.save();
    }
    if (cutil.a(opts.cgId)) {
      app._cgIds = {
        ...cutil.asObject(app._cgIds),
        ...Object.fromEntries(
          cutil
            .asString(opts.cgId)
            .split(",")
            .map((part) => part.split("=")),
        ),
      };
    }
    if (cutil.a(opts.setCgId)) {
      app.prefs.cgIds = {
        ...cutil.asObject(app.prefs.cgIds),
        ...Object.fromEntries(
          cutil
            .asString(opts.setCgId)
            .split(",")
            .map((part) => part.split("=")),
        ),
      };
      app.prefs.save();
    }
    if (cutil.a(opts.delCgId)) {
      let symbols = cutil.asString(opts.delCgId).split(",");
      for (let symbol of symbols) {
        delete app.prefs.cgIds[symbol];
      }
      app.prefs.save();
    }
  },
});

export { iwcoingeckoApp };
