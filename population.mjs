const plotlyLib = {
    label: 'Plotly',
    src: "https://cdn.plot.ly/plotly-2.3.1.min.js"
};
const handsontableLib = {
    label: 'Handsontable',
    src: "https://cdn.jsdelivr.net/npm/handsontable@9.0.2/dist/handsontable.full.min.js",
    css: ["https://cdn.jsdelivr.net/npm/handsontable@9.0.2/dist/handsontable.full.min.css"]
};

function fa_undo(strings) {
    return `
    <svg ${strings[0]} viewBox="0 0 32 32">
        <path d="M23.808 32c3.554-6.439 4.153-16.26-9.808-15.932v7.932l-12-12 12-12v7.762c16.718-0.436 18.58 14.757 9.808 24.238z"></path>
    </svg>
    `
}

export class PopPrj extends HTMLElement {
    url = "https://data.arakaki.tokyo";
    dfPath = "/static/jinko_suikei_2018/df";
    geoPath = "/static/jinko_suikei_2018/geo";
    totalUrl = `${this.url}/static/jinko_suikei_2018/total.json`;
    prefsUrl = `${this.url}/static/puboffice.json`;
    prefData;
    df;
    initPrefCode = 13;
    yearList;
    groupList;
    #zmax = [];
    vars = { pref: '13', year: '2020', group: '総数' }

    constructor() {
        super();
        this.loadLibs(plotlyLib);
        customElements.define('pop-com', PopCom);
    }
    applyStyle(elm, style) {
        Object.entries(style).forEach(([prop, value]) => elm.style[prop] = value);
    }

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
        this.applyStyle(this, {
            display: 'block',
            margin: '1rem',
        });

        /** get data */
        await Promise.all([
            this.getData(this.initPrefCode),
            fetch(this.prefsUrl).then((res) => res.json()).then(j => this.prefData = j)
        ]);

        this.yearList = [...new Set(this.df.index.map((i) => i.slice(0, 4)))];
        this.groupList = [...new Set(this.df.index.map((i) => i.slice(5)))];


        this.innerHTML = `
            <div style="position: relative; margin-right: 10px; margin-bottom: 30px;">
                <div data-role="mapContainer" style='margin-right: 20px'></div>
                <div data-role="colorScaleRange">
                <button data-role="undoBtn" style="transform: rotate(90deg); height: 18px">
                    ${fa_undo`width=12 height=12 fill="#333"`}
                </button>
            <input type="range" min="0" max="100" value="100" style="flex-grow: 2;">
                </div>
            </div>
            <pop-com data-role="popCom" data-url="${this.totalUrl}" data-init="${this.initPrefCode}"></pop-com>
        `;

        this.querySelectorAll("[data-role]").forEach(
            (elm) => (this[elm.dataset.role] = elm)
        );

        this.applyStyle(this.colorScaleRange, {
            width: "430px",
            display: "flex",
            position: "absolute",
            top: "30px",
            right: "0",
            transform: "rotate(-90deg)",
            transformOrigin: "center right",
        })

        // color scale change
        this.colorScaleRange.addEventListener("input", (e) => {
            Plotly.restyle(
                this.mapContainer,
                { zmax: this.zmax * 0.01 * Number(e.target.value) },
            );
        });
        this.colorScaleRange.addEventListener("change", (e) => {
            this.zmax = this.zmax * 0.01 * Number(e.target.value);
            e.target.value = 100;
        });
        this.undoBtn.onclick = (e) => {
            if (this.#zmax.length <= 1) return;
            this.#zmax.pop();
            Plotly.restyle(this.mapContainer, { zmax: this.zmax }, 0);
        };

        await this.initPlot(this.mapContainer, this.df, this.geoUrl);

        this.mapContainer.on('plotly_buttonclicked', this.updatePlot.bind(this));
        this.mapContainer.on('plotly_selected', this.mapSelected.bind(this))
    }

    set zmax(val) {
        this.#zmax.push(val);
    }
    get zmax() {
        return this.#zmax.slice(-1)[0];
    }

    getUrls(n) {
        return {
            df: `${this.url}${this.dfPath}/${String(n).padStart(2, "0")}.json`,
            geo: `${this.url}${this.geoPath}/${String(n).padStart(2, "0")}.json`,
        };
    }

    async getData(n) {
        let dfUrl;
        ({ df: dfUrl, geo: this.geoUrl } = this.getUrls(n));

        this.df = await fetch(dfUrl).then((res) => res.json());
    }

    getPrefCoordinte(n) {
        return this.prefData[n];
    }

    mapSelected(e) {
        const layout = {};
        if (e) {
            const sum = e.points.reduce((acc, cur) => acc + cur.z, 0);
            layout.annotations = [{
                x: 1,
                y: 0,
                text: `${Math.floor(sum).toLocaleString()}人`,
                showarrow: false,
                bgcolor: 'rgba(0,0,0,0.5)',
                font: { color: 'white' }
            }]
        } else {
            layout.annotations = []
        }

        Plotly.relayout(this.mapContainer, layout)
    }
    async updatePlot(e) {
        const layout = {};

        if (e.menu.name in this.vars) {
            if (e.menu.name === "pref") {
                this.vars.pref = e.button.name;
                // 都道府県選択でDF取得
                await this.getData(this.vars.pref);
                ({ lon: layout["mapbox.center.lon"], lat: layout["mapbox.center.lat"] } =
                    this.getPrefCoordinte(this.vars.pref));

                // lineと3dを更新
                this.popCom.plot(this.vars.pref);
            } else {
                this.vars[e.menu.name] = e.button.label;
            }
        } else {
            return;
        }

        const data = {
            locations: [this.df.columns],
            z: [this.df.data[this.df.index.indexOf(`${this.vars.year}_${this.vars.group}`)]],
            geojson: this.geoUrl,
        };

        // yearの選択ではscale不変。それ以外の選択(pref, group)で固定
        if (e.menu.name !== 'year') {
            this.#zmax = [];
            this.zmax = data.zmax = Math.max(...data.z[0]);
            this.zmin = data.zmin = Math.min(...data.z[0]);
        }

        Plotly.update(this.mapContainer, data, layout);
    }

    async initPlot(elm, df, geoUrl) {
        const map = {
            type: "choroplethmapbox",
            featureidkey: "id",
            locations: df.columns,
            z: df.data[
                df.index.indexOf(
                    `${this.vars.year}_${this.vars.group}`
                )
            ],
            geojson: geoUrl,
            marker: {
                line: { width: 0 },
                opacity: 0.5,
            },
            hoverinfo: "z",
            colorscale: "Jet",
        };
        this.zmax = map.zmax = Math.max(...map.z);
        this.zmin = map.zmin = Math.min(...map.z);

        const { lon, lat } = this.getPrefCoordinte(this.initPrefCode);
        const layout = {
            mapbox: {
                style: "white-bg",
                center: { lon, lat },
                layers: [
                    {
                        sourcetype: "raster",
                        source: [
                            "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
                        ],
                        below: "traces",
                    },
                ],
                zoom: 8,
            },
            updatemenus: [
                {
                    buttons: [
                        {
                            method: "relayout",
                            args: [
                                "mapbox.layers[0].source",
                                [
                                    "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
                                ],
                            ],
                            label: "衛星写真",
                        },
                        {
                            method: "relayout",
                            args: [
                                "mapbox.layers[0].source",
                                ["https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"],
                            ],
                            label: "地図",
                        },
                    ],
                    direction: "right",
                    type: "buttons",
                    xanchor: "left",
                    x: 0,
                },
                {
                    name: 'pref',
                    buttons: Object.entries(this.prefData)
                        .map(([code, obj]) => { return { method: 'skip', label: obj.name, name: code } }),
                    xanchor: "right",
                    x: 0,
                    yanchor: 'bottom',
                    y: 1.01,
                    active: this.initPrefCode - 1
                },
                {
                    name: 'year',
                    buttons: this.yearList.map(y => { return { method: 'skip', label: y } }),
                    direction: 'bottom',
                    type: 'buttons',
                    xanchor: "right",
                    x: -0.01,
                },
                {
                    name: 'group',
                    buttons: this.groupList.map(g => { return { method: 'skip', label: g } }),
                    direction: 'right',
                    type: 'buttons',
                    yanchor: 'bottom',
                    y: 1.01,
                    xanchor: "left",
                    x: 0.01
                },
            ],
            margin: { r: 0, t: 0, b: 0, l: 0 },
        };



        const config = {
            responsive: true,
        };
        await this[plotlyLib.label];
        Plotly.react(elm, [map], layout, config);
    }
}

export class PopPrjPref extends HTMLElement {
    url = "https://data.arakaki.tokyo";
    totalUrl = `${this.url}/static/jinko_suikei_2018/total.json`;
    geoUrl = `${this.url}/static/pref_hex.geo.json`
    #zmax = [];
    vars = { year: '2020', group: '総数', numOrRatio: '' }

    constructor() {
        super();
        this.loadLibs(plotlyLib);
        customElements.define('pop-com', PopCom);
    }
    applyStyle(elm, style) {
        Object.entries(style).forEach(([prop, value]) => elm.style[prop] = value);
    }

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
        this.applyStyle(this, {
            display: 'block',
            margin: '1rem',
        });

        /** get data */
        await Promise.all([
            fetch(this.totalUrl).then((res) => res.json()).then(j => this.total = j)
        ]);
        this.columns = this.total.columns.reduce((acc, val, idx) => { acc[val] = idx; return acc }, {});

        this.innerHTML = `
            <div style="position: relative; margin-right: 10px; margin-bottom: 30px;">
                <div data-role="mapContainer" style='margin-right: 20px'></div>
                <div data-role="colorScaleRange">
                    <button data-role="undoBtn" style="transform: rotate(90deg); height: 18px">
                        ${fa_undo`width=12 height=12 fill="#333"`}
                    </button>
                    <input type="range" min="1" max="100" value="100" style="flex-grow: 2;">
                </div>
            </div>
            <pop-com data-role="popCom" data-init="00"></pop-com>
        `;

        this.querySelectorAll("[data-role]").forEach(
            (elm) => (this[elm.dataset.role] = elm)
        );

        this.applyStyle(this.colorScaleRange, {
            width: "430px",
            display: "flex",
            position: "absolute",
            top: "30px",
            right: "0",
            transform: "rotate(-90deg)",
            transformOrigin: "center right",
        })

        // color scale change
        this.colorScaleRange.addEventListener("input", (e) => {
            Plotly.restyle(
                this.mapContainer,
                { zmax: this.zmin + (this.zmax - this.zmin) * 0.01 * Number(e.target.value) },
            );
        });
        this.colorScaleRange.addEventListener("change", (e) => {
            this.zmax = this.zmin + (this.zmax - this.zmin) * 0.01 * Number(e.target.value);
            e.target.value = 100;
        });
        this.undoBtn.onclick = (e) => {
            if (this.#zmax.length <= 1) return;
            this.#zmax.pop();
            Plotly.restyle(this.mapContainer, { zmax: this.zmax }, 0);
        };

        await this.initPlot();

        this.mapContainer.on('plotly_buttonclicked', this.updatePlot.bind(this));
        this.mapContainer.on('plotly_selected', this.mapSelected.bind(this));
        this.mapContainer.on('plotly_click', this.prefClick.bind(this));
        this.mapContainer.on('plotly_doubleclick', this.prefDblClick.bind(this));

        this.popCom.total = this.total;
    }

    prefClick(e) {
        console.log(e)
        this.popCom.plot(e.points[0].location);
    }

    prefDblClick(e) {
        this.popCom.plot("00");
    }

    mapSelected(e) {
        console.log(e)
        const layout = {};
        if (e) {
            const sum = e.points.reduce((acc, cur) => acc + cur.z, 0);
            layout.annotations = [{
                x: 1,
                y: 0,
                text: `${Math.floor(sum).toLocaleString()}人`,
                showarrow: false,
                bgcolor: 'rgba(0,0,0,0.5)',
                font: { color: 'white' }
            }]
        } else {
            layout.annotations = []
        }

        Plotly.relayout(this.mapContainer, layout)
    }

    updatePlot(e) {
        const data = {};
        if (e.menu.name === 'numOrRatio') {
            this.vars.numOrRatio = e.menu.active;
            if (this.vars.numOrRatio) {
                data.hovertemplate = '%{z:.1%} <extra>%{properties.name}</extra>';
            } else {
                data.hovertemplate = '%{z:,d} <extra>%{properties.name}</extra>';
            }
        } else {
            this.vars[e.menu.name] = e.button.label;
        }

        const c = this.columns[`${this.vars.numOrRatio ? `${this.vars.year}r` : this.vars.year}`];
        data.z = [this.total.data
            .filter(r => r[this.columns.pref] !== "00" && r[this.columns.group] === this.vars.group)
            .map(r => r[c])
        ];

        if (e.menu.name !== 'year') {
            this.#zmax = [];
            this.zmax = data.zmax = Math.max(...data.z[0]) * 1.1;
            this.zmin = data.zmin = Math.min(...data.z[0]) * 0.9;
        }

        Plotly.restyle(this.mapContainer, data);
    }

    async initPlot() {
        const sosu = this.total.data
            .filter(r => r[this.columns.pref] !== "00")
            .filter(r => r[this.columns.group] === "総数");

        const map = {
            type: "choroplethmapbox",
            featureidkey: "id",
            locations: sosu.map(r => r[this.columns.pref]),
            z: sosu.map(r => r[this.columns["2020"]]),
            geojson: this.geoUrl,
            hovertemplate: '%{z:,d} <extra>%{properties.name}</extra>',
            marker: {
                line: { width: 0 },
                opacity: 0.5,
            },
            colorscale: "Jet",
        };
        this.zmax = map.zmax = Math.max(...map.z) * 1.1;
        this.zmin = map.zmin = Math.min(...map.z) * 0.9;
        const layout = {
            mapbox: {
                style: "white-bg",
                center: { lon: 137.37, lat: 38.5 },
                zoom: 4,
                layers: [
                    {
                        sourcetype: 'image',
                        color: '#F00',
                        source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcPWvWfwAGdwLQpoInnAAAAABJRU5ErkJggg==',
                        coordinates: [[90, 50], [200, 50], [200, 20], [90, 20]],
                        below: "traces",

                    }
                ],

            },
            updatemenus: [
                {
                    name: 'numOrRatio',
                    buttons: [
                        {
                            method: "skip",
                            label: "実数(人)",
                        },
                        {
                            method: "skip",
                            label: "比率(%)",
                        },
                    ],
                    direction: "bottom",
                    type: "buttons",
                    xanchor: "right",
                    x: -0.01,
                },
                {
                    name: 'year',
                    buttons: this.total.columns.filter(c => !Number.isNaN(Number(c)))
                        .map(y => { return { method: 'skip', label: y } }),
                    direction: 'right',
                    type: 'buttons',
                    yanchor: 'bottom',
                    y: 1.01,
                    xanchor: "left",
                    x: 0.01
                },
                {
                    name: 'group',
                    buttons: this.total.data
                        .filter(r => r[this.columns.pref] == '00')
                        .map(r => { return { method: 'skip', label: r[this.columns.group] } }),
                    xanchor: "right",
                    x: 0,
                    yanchor: 'bottom',
                    y: 1.01,
                    active: 0
                },
            ],
            margin: { r: 0, t: 0, b: 0, l: 0 },
        };



        const config = {
            responsive: true,
        };

        await this[plotlyLib.label];
        Plotly.react(this.mapContainer, [map], layout, config);
    }
    set zmax(val) {
        this.#zmax.push(val);
    }
    get zmax() {
        return this.#zmax.slice(-1)[0];
    }

}

export class PopCom extends HTMLElement {
    totalUrl;
    #total;

    set total(val) { this.#total = val; this.init(); }
    get total() { return this.#total }

    constructor() {
        super();
        [plotlyLib, handsontableLib].forEach(this.loadLibs.bind(this));
    }

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

    applyStyle(elm, style) {
        Object.entries(style).forEach(([prop, value]) => elm.style[prop] = value);
    }

    async connectedCallback() {
        this.applyStyle(this, {
            display: 'block',
        });

        this.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 3fr; height: 600px">
            <div data-role="lineContainer"></div>
            <div data-role="threeDContainer"></div>
        </div>
        <div data-role="gridContainer" style="font-size: .8rem;"></div>
        `;

        this.querySelectorAll("[data-role]").forEach(
            (elm) => (this[elm.dataset.role] = elm)
        );

        if ('url' in this.dataset) {
            this.totalUrl = this.dataset.url;
            this.total = await fetch(this.totalUrl).then((res) => res.json());
        }
    }

    async init() {
        this.columns = this.total.columns.reduce((acc, val, idx) => { acc[val] = idx; return acc }, {});
        this.yearList = this.total.columns.filter(c => !Number.isNaN(Number(c)));

        if ('init' in this.dataset) {
            await this.Plotly;
            this.plot(this.dataset.init);
        }
        await this.Handsontable;
        this.drawGrid();
    }

    drawGrid() {
        function numRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.NumericRenderer.apply(this, arguments);

            // 同グループの2020年と比較して増減を背景色で表現
            const current = instance.getDataAtCell(row, this.columns["2020"]);
            const diff = 1 - value / current;
            if (diff < 0) {
                td.style.background = `hsla(180, 100%, 50%, ${Math.abs(diff)})`
            } else if (diff > 0) {
                td.style.background = `hsla(0, 100%, 50%, ${diff})`
            }
        }
        Handsontable.renderers.registerRenderer('numRenderer', numRenderer.bind(this));

        function ratioRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.NumericRenderer.apply(this, arguments);

            // 同グループの2020年と比較して増減を背景色で表現
            const current = instance.getDataAtCell(row, this.columns["2020"] + this.yearList.length);
            const diff = 1 - value / current;
            if (diff < 0) {
                td.style.background = `hsla(180, 100%, 50%, ${Math.abs(diff)})`
            } else if (diff > 0) {
                td.style.background = `hsla(0, 100%, 50%, ${diff})`
            }
        }
        Handsontable.renderers.registerRenderer('ratioRenderer', ratioRenderer.bind(this));

        const columns = [
            { data: `${this.columns.pref}` },
            { data: `${this.columns.name}` },
            { data: `${this.columns.group}` },
            ...this.yearList.map((y, i) => {
                return {
                    data: `${this.columns[y]}`,
                    type: 'numeric',
                    numericFormat: {
                        pattern: {
                            thousandSeparated: true,
                            mantissa: 0
                        },
                    },
                    renderer: 'numRenderer'
                }
            }),
            ...this.yearList.map((y, i) => {
                return {
                    data: `${this.columns[`${y}r`]}`,
                    type: 'numeric',
                    numericFormat: {
                        pattern: {
                            output: 'percent',
                            mantissa: 1
                        },
                    },
                    renderer: 'ratioRenderer'
                }
            }),
        ];

        const yearHeaderTmpl = { colspan: this.yearList.length };
        const hot = new Handsontable(this.gridContainer, {
            readOnly: true,
            data: this.total.data,
            rowHeaders: true,
            nestedHeaders: [
                ['', { colspan: 2, label: "" }, Object.assign({ label: '人口' }, yearHeaderTmpl), Object.assign({ label: '比率' }, yearHeaderTmpl)],
                ['', "都道府県", "年齢階級", ...this.yearList, ...this.yearList]
            ],
            collapsibleColumns: [
                { row: -2, col: 3, collapsible: true },
                { row: -2, col: 10, collapsible: true }
            ],
            hiddenColumns: {
                // 1列目の都道府県コードは非表示。rendererで総数を検索する際に使用する。
                columns: [0],
            },
            fixedColumnsLeft: 3,
            height: 600,
            dropdownMenu: [
                "filter_by_value",
                "filter_action_bar",
            ],
            filters: true,
            columnSorting: true,
            columns,
            licenseKey: 'non-commercial-and-evaluation'
        });
    }
    plot(n) {
        this.drawLinePlot(n);
    }
    drawLinePlot(n) {
        n = String(n).padStart(2, "0");
        const traceTemplate = {
            hovertemplate: "%{y:,d}人",
            marker: { symbol: "circle" },
            mode: "lines+markers",
            orientation: "v",
            showlegend: true,
            type: "scatter",
            xaxis: "x",
            yaxis: "y",
            x: this.yearList
        };

        const rows = this.total.data.filter(row => row[this.columns.pref] == n);
        const traces = rows.filter(row => /^(?!(総数|0～14歳|15～64歳|65歳以上))/.exec(row[this.columns.group])).map(row => {
            return { name: row[this.columns.group], y: this.yearList.map(y => row[this.columns[y]]) }
        })

        const layout = {
            title: {
                text: rows[0][this.columns.name],
                xanchor: 'right',
                x: 1,
                pad: { r: 5 }
            },
            margin: { t: 0, r: 0, b: 50, l: 50, },
            hovermode: "x",
            legend: { traceorder: "reversed" },
            updatemenus: [
                {
                    buttons: [
                        {
                            method: "restyle",
                            args: ["stackgroup", ""],
                            label: "折れ線",
                        },
                        {
                            method: "restyle",
                            args: ["stackgroup", "foo"],
                            label: "積み上げ",
                        },
                    ],
                    type: "buttons",
                    direction: 'right',
                    xanchor: 'left',
                    y: 1.15
                },
            ],
            xaxis: { dtick: "M60", tickformat: "%Y", type: 'date' },
            yaxis: { tickformat: "s", title: { text: "人口" } },
        };

        var data = traces.map(t => Object.assign(t, traceTemplate));

        Plotly.react(this.lineContainer, data, layout, { responsive: true });
        this.drawThreeDPlot(traces);
    }

    drawThreeDPlot(tracesOrg) {
        const z = [];
        const y = [];

        for (const t of tracesOrg) {
            z.push(t.y);
            y.push(t.name)
        }

        const data = [{
            x: this.yearList,
            y,
            z,
            type: "surface",
            contours: {
                z: { usecolormap: true, highlightcolor: '#AAA', highlightwidth: 16 },
            },
            lighting: {
                roughness: 0.2,
            },
            lightposition: { x: 100, y: -10000, z: 100 },
            colorscale: 'Jet'
        }];

        const layout = {
            margin: { t: 0, r: 0, b: 50, l: 50, },
            scene: {
                xaxis: { showspikes: false },
                yaxis: { showspikes: false },
                zaxis: { showspikes: false },
                camera: {
                    eye: {
                        x: -2,
                        y: 0,
                        z: 0
                    }
                }
            }
        }

        Plotly.react(this.threeDContainer, data, layout, { responsive: true })

    }

}