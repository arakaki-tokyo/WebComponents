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
        if ('Plotly' in globalThis) {
            this.plotlyLoad = Promise.resolve();
        } else {
            const plotlyLib = document.createElement('script');
            plotlyLib.src = "https://cdn.plot.ly/plotly-2.3.1.min.js";
            this.plotlyLoad = new Promise(resolve => {
                plotlyLib.onload = () => resolve();
            });
            document.head.appendChild(plotlyLib);
        }
        customElements.define('pop-com', PopCom);
    }
    applyStyle(elm, style) {
        Object.entries(style).forEach(([prop, value]) => elm.style[prop] = value);
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
                    <button data-role="undoBtn" style="transform: rotate(90deg);border-radius: 50%;border: solid 1px gray;">↩️</button>
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
        await this.plotlyLoad;
        Plotly.react(elm, [map], layout, config);
    }
}
export class PopCom extends HTMLElement {
    totalUrl;

    constructor() {
        super();
        const libs = [
            {
                label: 'Plotly',
                src: "https://cdn.plot.ly/plotly-2.3.1.min.js"
            },
            {
                label: 'Handsontable',
                src: "https://cdn.jsdelivr.net/npm/handsontable@9.0.2/dist/handsontable.full.min.js",
                css: ["https://cdn.jsdelivr.net/npm/handsontable@9.0.2/dist/handsontable.full.min.css"]
            }
        ];

        libs.forEach(this.loadLibs.bind(this));
    }

    loadLibs(info) {
        if (info.label in globalThis) {
            this[`${info.label}Load`] = Promise.resolve();
        } else {
            const lib = document.createElement('script');
            lib.src = info.src;
            this[`${info.label}Load`] = new Promise(resolve => {
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

        if ('url' in this.dataset) {
            this.totalUrl = this.dataset.url;
        } else {
            console.log('"data-url" attribute is required.');
            return;
        }

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

        this.total = await fetch(this.totalUrl).then((res) => res.json());
        this.columns = this.total.columns.reduce((acc, val, idx) => { acc[val] = idx; return acc }, {});
        this.yearList = this.total.columns.filter(c => !Number.isNaN(Number(c)));

        if ('init' in this.dataset) {
            await this.PlotlyLoad;
            this.plot(this.dataset.init);
        }
        await this.HandsontableLoad;
        this.drawGrid();

    }
    drawGrid() {
        function myRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.NumericRenderer.apply(this, arguments);

            // 同年の総数から比率を計算
            const idx = this.total.index.findIndex(i => i === `${instance.getDataAtCell(row, this.columns.pref)}_総数`);
            const totalOfYear = this.total.data[idx][col];
            td.innerHTML += `<small>(${Math.round(value * 1000 / totalOfYear) / 10}%)</small>`;

            // 同グループの2020年と比較して増減を背景色で表現
            const current = instance.getDataAtCell(row, 3);
            const diff = 1 - value / current;
            if (diff < 0) {
                td.style.background = `hsla(180, 100%, 50%, ${Math.abs(diff)})`
            } else if (diff > 0) {
                td.style.background = `hsla(0, 100%, 50%, ${diff})`
            }
        }
        Handsontable.renderers.registerRenderer('myRenderer', myRenderer.bind(this));

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
                    renderer: 'myRenderer'
                }
            }),
        ];
        const hot = new Handsontable(this.gridContainer, {
            readOnly: true,
            data: this.total.data,
            rowHeaders: true,
            colHeaders: ['', "都道府県", "年齢階級", ...this.yearList],
            hiddenColumns: {
                // 1列目の都道府県コードは非表示。rendererで総数を検索する際に使用する。
                columns: [0],
            },
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