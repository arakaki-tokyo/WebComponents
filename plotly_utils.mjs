const plotlyLib = {
    label: 'Plotly',
    src: "https://cdn.plot.ly/plotly-2.4.2.min.js"
};


function convertPoint({ geo, color, size = 5, sizeref = 1, hovertemplate }) {
    const traces = [];
    if (typeof (geo.features[0].properties[color]) === "string") {
        // classify discretely
        const traceTmpl = {
            type: "scattermapbox",
            mode: "markers",
            name: "",
            lat: null,
            lon: null,
            customdata: null,
            hovertemplate,
            marker: {
                size: null,
                sizemode: "area",
                sizeref,
                sizemin: 2
            },
            showlegend: true,


        };
        for (const feature of geo.features) {
            if (feature.geometry.type !== "Point") continue;

            let trace;
            if (trace = traces.find(t => t.name === feature.properties[color])) {
                // do nothing
            } else {
                trace = JSON.parse(JSON.stringify(traceTmpl));
                trace.lat = [];
                trace.lon = [];
                trace.marker.size = [];
                trace.customdata = [];
                trace.name = feature.properties[color];
                traces.push(trace);
            }

            trace.lon.push(feature.geometry.coordinates[0]);
            trace.lat.push(feature.geometry.coordinates[1]);
            if (typeof (size) === "string") {
                trace.marker.size.push(feature.properties[size]);
            } else {
                trace.marker.size.push(size);
            }
            trace.customdata.push(feature.properties);
        };
    } else if (typeof (geo.features[0].properties[color]) === "number") {
        // classify continuously
        const trace = {
            type: "scattermapbox",
            mode: "markers",
            name: "",
            lat: [],
            lon: [],
            customdata: [],
            hovertemplate,
            marker: {
                color: [],
                size: Number(size),
                colorbar: {}
            },
        };
        traces.push(trace);
        for (const feature of geo.features) {
            if (feature.geometry.type !== "Point") continue;

            trace.lon.push(feature.geometry.coordinates[0]);
            trace.lat.push(feature.geometry.coordinates[1]);
            trace.marker.color.push(feature.properties[color]);
            trace.customdata.push(feature.properties);
        };
    }

    return traces;
}

function convertLineString(geo, name) {
    function coordsToLonLat(coordinates) {
        return {
            lon: coordinates.map(coord => coord[0]),
            lat: coordinates.map(coord => coord[1])
        }
    }
    const traces = [];
    const traceTmpl = {
        type: "scattermapbox",
        mode: "lines",
        showlegend: true,

    };
    for (const feature of geo.features) {
        const trace = {
            name: feature.properties[name],
            showlegend: true,
            legendgroup: feature.properties[name],
            lon: [],
            lat: [],
        };

        if (feature.geometry.type === "LineString") {
            traces.push(Object.assign(trace, coordsToLonLat(feature.geometry.coordinates), traceTmpl));
        } else if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach((coords, i) => {
                const lonlat = coordsToLonLat(coords);
                trace.lon.push(...lonlat.lon, "");
                trace.lat.push(...lonlat.lat, "");
            });
            traces.push(Object.assign(trace, traceTmpl));
        } else {
            continue;
        }
    };

    return traces;
}

/**
 * PlotlyでMapを表示するためのベースクラス
 * 
 * ## Tag Interface
 * ### attributes:
 *  - geojson: string. URL of geojson
 * 
 * ## Programmatic Interface
 * ### properties:
 *  - geojson: string | object
 *      set this property, then 'plot' method called.
 *      So sub class must define 'plot' method.
 *  - init: Promise. 
 *      resolve when Plotly container redy.
 *      then, you can call 'on' method.
 * 
 * ### events:
 *  - initialized: dispached when plotly container redy
 */
export class PlotlyMap extends HTMLElement {
    #geojson;
    init;

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

    constructor() {
        super();
        Object.entries({
            display: "block",
            visibility: "hidden"
        }).forEach(([key, val]) => this.style[key] = val);

        this.loadLibs(plotlyLib);

        for (let attr of this.attributes) {
            if (attr.name.match(/style/g)) continue;
            this[attr.name] = attr.value;
        }

        this.init = (async () => {
            await this.Plotly;
            await Plotly.newPlot(this, [], this.layout);
            this.dispatchEvent(new Event("initialized"));
        })();
    }

    set geojson(val) {
        return (async () => {
            if (typeof val === "string") {
                this.#geojson = await fetch(val).then(res => res.json());
            } else {
                this.#geojson = val;
            }
            await this.init;

            this.plot();
            this.style.visibility = "visible";
        })()
    }
    get geojson() { return this.#geojson }

    autoZoom(minx, miny, maxx, maxy) {
        const deg2rag = deg => deg / 180 * Math.PI;
        const r = 6371;

        const g = Math.acos(
            Math.sin(deg2rag(minx)) * Math.sin(deg2rag(maxx))
            + Math.cos(deg2rag(minx)) * Math.cos(deg2rag(maxx)) * Math.cos(deg2rag(maxy - miny)));

        const distance = r * g;
        return 16.25 - (Math.log(distance) * 1.5 + 1000 / this.layout.height - 1);
    }
}

/**
 * geojson(type: "LineString")を受け取ってPlotlyで描画する。
 * 
 * ## Tag Interface
 * ### attributes:
 *  - geojson: string. URL of geojson
 *  - color: one of properties of geojson  
 * 
 * ## Programmatic Interface
 * ### properties:
 *  - geojson: string | object
 * 
 * ### events:
 *  - initialized: dispached when plotly container redy
 */
export class LineMapbox extends PlotlyMap {
    #initialized = false;

    constructor() {
        super();
        this.setInitialLayout();
    }

    setInitialLayout() {
        this.layout = Object.assign(
            {
                height: document.documentElement.clientHeight - 20,
                legend: { title: { text: this.color }, tracegroupgap: 0 },
                mapbox: {
                    style: "carto-darkmatter",
                },
                margin: { t: 50, b: 10, l: 10 },
                updatemenus: [{
                    buttons: [
                        'carto-darkmatter',
                        'carto-positron',
                        'open-street-map',
                        'stamen-terrain',
                        'stamen-toner',
                        'stamen-watercolor',
                        'white-bg'
                    ].map(style => {
                        return {
                            method: 'relayout',
                            args: ['mapbox.style', style],
                            label: style
                        }
                    }),
                    xanchor: "left",
                    x: 0,
                    yanchor: "top",
                    y: 1
                }

                ]
            },
            Function(`return ${this.dataset.layout}`)()
        );

    }
    async plot() {
        await this[plotlyLib.label];
        const data = convertLineString(this.geojson, this.color);
        const { minx, miny, maxx, maxy } = getBounds(data);
        this.layout.mapbox.center = { lat: (maxy + miny) / 2, lon: (maxx + minx) / 2 };

        if (!this.#initialized) {
            this.#initialized = true;
            this.layout.mapbox.zoom = this.autoZoom(minx, miny, maxx, maxy);
        }

        Plotly.react(this, data, this.layout, { responsive: true });
    }

}

/**
 * geojson(type: "Point")を受け取ってPlotlyで描画する。
 * 
 * ## Tag Interface
 * ### attributes:
 *  - geojson: string. URL of geojson
 *  - color: one of properties of geojson  
 *      - 指定したproperty値が文字列(離散データ)の場合、traceで分類しlegendを表示する。  
 *      - 数字(連続データ)の場合、1つのtraceにまとめてcolor scaleを表示する。  
 *  - size: one of properties of geojson or Number  
 *      - colorが離散データの場合、geojsonのpropertiesのkeyと判断されポイントの大きさとなる。  
 *      - colorが連続データの場合、ポイントの大きさを一括指定する。   
 *  - sizeref: Number  
 *      - sizeの縮尺を指定。1以上だとポイントは小さくなり、1未満だと大きくなる。  
 *      - 離散データでポイントの大きさを一括指定したい場合はこれを使用する。  
 *  - hovertemplate: string  
 *      - geojsonのpropertiesは`%{customdata.prop}`の形で指定可能
 * 
 * ## Programmatic Interface
 * ### properties:
 *  - geojson: string | object
 * 
 * ### events:
 *  - initialized: dispached when plotly container redy
 */
export class ScatterMapbox extends PlotlyMap {
    #initialized = false;

    constructor() {
        super();

        this.setInitialLayout();
    }

    setInitialLayout() {
        this.layout = Object.assign(
            {
                height: document.documentElement.clientHeight - 20,
                legend: { title: { text: this.color }, tracegroupgap: 0 },
                mapbox: {
                    style: "carto-darkmatter",
                },
                margin: { t: 50, b: 10, l: 10 },
                updatemenus: [
                    {
                        buttons: [
                            'carto-darkmatter',
                            'carto-positron',
                            'open-street-map',
                            'stamen-terrain',
                            'stamen-toner',
                            'stamen-watercolor',
                            'white-bg'
                        ].map(style => {
                            return {
                                method: 'relayout',
                                args: ['mapbox.style', style],
                                label: style
                            }
                        }),
                        xanchor: "left",
                        x: 0,
                        yanchor: "top",
                        y: 1
                    }
                ]
            },
            Function(`return ${this.dataset.layout}`)()
        );
        if (this.size) {
            this.layout.updatemenus.push({
                name: "size",
                buttons: [
                    ["➕", "plus"],
                    ["➖", "minus"]
                ].map(([label, name]) => {
                    return {
                        method: "skip",
                        label,
                        name
                    }
                }),
                type: "buttons",
                xanchor: "left",
                x: 0,
                yanchor: "bottom",
                y: 0
            })
        }
        if (this.option) {
            const option = Function(`return [${this.option}]`)();
            this.layout.updatemenus.push({
                name: "option",
                buttons: option.map(opt => {
                    return {
                        method: "skip",
                        label: opt,
                        name: opt
                    }
                }),
                direction: "right",
                type: "buttons",
                xanchor: "right",
                x: 1,
                yanchor: "bottom",
                y: 1.005,
                active: option.findIndex(opt => opt.match(`${this.color}|${this.size}`))
            })

        }

    }

    async connectedCallback() {
        await this.init;

        this.on("plotly_buttonclicked", e => {
            if (e.menu.name !== "size") return;
            if (e.button.name === "plus") {
                if (this.sizeref <= 0) return;
                this.sizeref = this.sizeref / 1.2;
            } else if (e.button.name === "minus") {
                this.sizeref = this.sizeref * 1.2;
            }
            Plotly.restyle(this, { 'marker.sizeref': this.sizeref })
        })

        this.on("plotly_selected", e => {
            const key = typeof (this.geojson.features[0].properties[this.color]) === "string" ?
                "marker.size" : "marker.color";
            const layout = {};
            if (e) {
                const sum = e.points.reduce((acc, p) => acc + p[key], 0);
                layout.annotations = [{
                    x: 1,
                    y: 0,
                    text: Math.floor(sum).toLocaleString(),
                    showarrow: false,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    font: { color: 'white' }
                }]
            } else {
                layout.annotations = []
            }

            Plotly.relayout(this, layout)

        })

        if (this.option) {
            this.on('plotly_buttonclicked', e => {
                if (e.menu.name !== 'option') return;
                if (this.size) this.size = e.button.name;
                else this.color = e.button.name;

                Plotly.react(
                    this,
                    convertPoint({
                        geo: this.geojson,
                        color: this.color,
                        size: this.size,
                        sizeref: this.sizeref,
                        hovertemplate: this.hovertemplate
                    }),
                    this.layout
                )
            })
        }
    }

    update(key, value) {
        this[key] = value;
        this.plot();
    }

    async plot() {
        await this[plotlyLib.label];
        const data = convertPoint({
            geo: this.geojson,
            color: this.color,
            size: this.size,
            sizeref: this.sizeref,
            hovertemplate: this.hovertemplate
        });
        const { minx, miny, maxx, maxy } = getBounds(data);

        this.layout.mapbox.center = { lat: (maxy + miny) / 2, lon: (maxx + minx) / 2 };
        if (!this.#initialized) {
            this.#initialized = true;
            this.layout.mapbox.zoom = this.autoZoom(minx, miny, maxx, maxy);
        }

        Plotly.react(this, data, this.layout, { responsive: true });
    }

}

/**
 * @param {Array} traces array of trace which type is scattermapbox and mode is line
 * @return {Object} like {minx, miny, maxx, maxy}
 */
function getBounds(traces) {
    const min = (a, b) => a - b;
    const max = (a, b) => b - a;
    const compare = (target, compared, f) => {
        if (Number.isNaN(bounds[target]) || f(bounds[target], compared) > 0)
            bounds[target] = compared;
    }
    const bounds = {
        minx: NaN,
        miny: NaN,
        maxx: NaN,
        maxy: NaN,
    }

    traces.forEach(trace => {
        const ix = Math.min(...trace.lon.filter(n => n !== ""));
        const iy = Math.min(...trace.lat.filter(n => n !== ""));
        const ax = Math.max(...trace.lon.filter(n => n !== ""));
        const ay = Math.max(...trace.lat.filter(n => n !== ""));

        compare("minx", ix, min);
        compare("miny", iy, min);
        compare("maxx", ax, max);
        compare("maxy", ay, max);
    });

    return bounds;
}

