const plotlyLib = {
    label: 'Plotly',
    src: "https://cdn.plot.ly/plotly-2.4.2.min.js"
};
import { LineMapbox } from "./plotly_utils.mjs";

export class RoadJP extends LineMapbox {
    url = 'https://data.arakaki.tokyo';
    kosokuUrl = `${this.url}/static/road/kosoku.geo.json`;
    kokudoUrl = `${this.url}/static/road/kokudo.geo.json`;
    color = "name";

    constructor() {
        super();

        this.layout.legend.title.text = this.color;
        this.layout.updatemenus.push({
            name: 'road-type',
            buttons: [
                { method: 'skip', label: "高速道路", name: this.kosokuUrl },
                { method: 'skip', label: "国道", name: this.kokudoUrl },
            ],
            type: "buttons",
            direction: "right",
            xanchor: "left",
            x: 0,
            yanchor: 'bottom',
            y: 1.005,
            active: this.initPrefCode - 1
        })

        this.geojson = this.kosokuUrl;
        this.init.then(() => {
            this.on("plotly_buttonclicked", e => {
                if (e.menu.name !== "road-type") return;

                this.geojson = e.button.name
            })
        })
    }
}

export class RoadPref extends LineMapbox {
    url = 'https://data.arakaki.tokyo';
    prefsUrl = `${this.url}/static/puboffice.json`;
    initPrefCode = 13;
    getUrl = n => `${this.url}/static/road/${String(n).padStart(2, "0")}.geo.json`;
    color = "name";

    constructor() {
        super();

        (async () => {
            this.prefsData = await fetch(this.prefsUrl).then(res => res.json());

            this.layout.legend.title.text = this.color;
            this.layout.updatemenus.push({
                name: 'pref',
                buttons: Object.entries(this.prefsData)
                    .map(([code, obj]) => { return { method: 'skip', label: obj.name, name: code } }),
                xanchor: "left",
                x: 0,
                yanchor: 'bottom',
                y: 1.005,
                active: this.initPrefCode - 1
            })

            await this.init;
            this.on("plotly_buttonclicked", e => {
                if (e.menu.name !== "pref") return;
                this.geojson = this.getUrl(e.button.name);
            })

            this.geojson = this.getUrl(this.initPrefCode);
        })();
    }
}
