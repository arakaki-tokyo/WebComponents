const plotlyLib = {
    label: 'Plotly',
    src: "https://cdn.plot.ly/plotly-2.4.2.min.js"
};

export class RoadJP extends HTMLElement {
    url = 'https://data.arakaki.tokyo';
    kosokuUrl = `${this.url}/static/road/kosoku.geo.json`;
    kokudoUrl = `${this.url}/static/road/kokudo.geo.json`;

    loadLibs(info) {
        if (info.label in globalThis) {
            this[`${info.label}`] = Promise.resolve();
        } else {
            const lib = document.createElement('script');
            lib.src = info.src;
            this[`${info.label}`] = new Promise(resolve => {
                lib.onload = () => resolve();
            });
            document.head.appendChild(lib);

            if (info.css) {
                info.css.forEach(url => {
                    const link = document.createElement('link');
                    link.rel = "stylesheet";
                    link.href = url;
                    document.head.appendChild(link);
                })
            }
        }
    }

    async connectedCallback() {
        [plotlyLib].forEach(this.loadLibs.bind(this));
        await this.Plotly;

        this.innerHTML = `<line-mapbox geojson='${this.kosokuUrl}' data-role="map"></line-mapbox>`;

        const { LineMapbox } = await import("./plotly_utils.mjs");
        customElements.define('line-mapbox', LineMapbox);

        this.querySelectorAll("[data-role]").forEach(elm => (this[elm.dataset.role] = elm));

        await new Promise(resolve => this.map.addEventListener('initialized', () => resolve()));
        await new Promise(resolve => this.map.on("plotly_afterplot", e => resolve()))

        Plotly.relayout(this.map, {
            updatemenus: [...this.map.layout.updatemenus, {
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
            }]
        })

        this.map.on("plotly_buttonclicked", e => {
            if (e.menu.name !== "road-type") return;

            this.map.geojson = e.button.name
        })
    }
}

export class RoadPref extends HTMLElement {
    url = 'https://data.arakaki.tokyo';
    prefsUrl = `${this.url}/static/puboffice.json`;
    initPrefCode = 13;
    initUrl = `${this.url}/static/road/13.geo.json`;
    getUrl = n => `${this.url}/static/road/${String(n).padStart(2, "0")}.geo.json`;
    loadLibs(info) {
        if (info.label in globalThis) {
            this[`${info.label}`] = Promise.resolve();
        } else {
            const lib = document.createElement('script');
            lib.src = info.src;
            this[`${info.label}`] = new Promise(resolve => {
                lib.onload = () => resolve();
            });
            document.head.appendChild(lib);

            if (info.css) {
                info.css.forEach(url => {
                    const link = document.createElement('link');
                    link.rel = "stylesheet";
                    link.href = url;
                    document.head.appendChild(link);
                })
            }
        }
    }

    async connectedCallback() {
        [plotlyLib].forEach(this.loadLibs.bind(this));
        await this.Plotly;

        this.innerHTML =
            `<line-mapbox geojson='${this.getUrl(this.initPrefCode)}' data-role="map"></line-mapbox>`;

        const { LineMapbox } = await import("./plotly_utils.mjs");
        customElements.define('line-mapbox', LineMapbox);


        this.querySelectorAll("[data-role]").forEach(elm => (this[elm.dataset.role] = elm));

        await Promise.all([
            fetch(this.prefsUrl).then((res) => res.json()).then(j => this.prefsData = j),
            new Promise(resolve =>
                this.map.addEventListener('initialized', () => this.map.on("plotly_afterplot", e => resolve())))
        ]);

        Plotly.relayout(this.map, {
            updatemenus: [...this.map.layout.updatemenus, {
                name: 'pref',
                buttons: Object.entries(this.prefsData)
                    .map(([code, obj]) => { return { method: 'skip', label: obj.name, name: code } }),
                xanchor: "left",
                x: 0,
                yanchor: 'bottom',
                y: 1.005,
                active: this.initPrefCode - 1
            }]
        })

        this.map.on("plotly_buttonclicked", e => {
            if (e.menu.name !== "pref") return;

            this.map.geojson = this.getUrl(e.button.name);
        })
    }
}
