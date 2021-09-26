import { ScatterMapbox } from "./plotly_utils.mjs";
export class StationJP extends ScatterMapbox {
    initPrefCode = 13;
    prefsUrl = 'https://data.arakaki.tokyo/static/puboffice.json';
    prefsData;
    getUrl = n => `https://data.arakaki.tokyo/static/station/${String(n).padStart(2, "0")}.geo.json`

    constructor() {
        super();

        (async () => {
            let geo;
            await Promise.all([
                fetch(this.prefsUrl).then((res) => res.json()).then(j => this.prefsData = j),
                fetch(this.getUrl(this.initPrefCode)).then(res => res.json()).then(j => geo = j)
            ]);

            this.layout.updatemenus.push({
                name: 'pref',
                buttons: [
                    { method: 'skip', label: "全国", name: "00" },
                    ...Object.entries(this.prefsData)
                        .map(([code, obj]) => { return { method: 'skip', label: obj.name, name: code } })],
                xanchor: "left",
                x: 0,
                yanchor: 'bottom',
                y: 1.005,
                active: this.initPrefCode
            })

            this.geojson = geo;
        })();

        this.init.then(() => {
            this.on("plotly_buttonclicked", e => {
                if (e.menu.name !== "pref") return;
                this.geojson = this.getUrl(e.button.name);
            })
        })
    }
}

