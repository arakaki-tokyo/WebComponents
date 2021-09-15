const plotlyLib = {
    label: 'Plotly',
    src: "https://cdn.plot.ly/plotly-2.4.2.min.js"
};


function convertLineString(geo) {
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
            name: feature.properties.name,
            showlegend: true,
            legendgroup: feature.properties.name,
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


export class LineMapbox extends HTMLElement {
    #geojson;
    #initialized = false;

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
        Object.entries({
            display: "block",
            visibility: "hidden"
        }).forEach(([key, val]) => this.style[key] = val);

        [plotlyLib].forEach(this.loadLibs.bind(this));

        if ("geojson" in this.attributes) {
            this.geojson = this.getAttribute("geojson");
        }

        await this.Plotly;
        await Plotly.newPlot(this);
        this.dispatchEvent(new Event("initialized"));

    }

    set geojson(val) {
        return (async () => {
            if (typeof val === "string") {
                this.#geojson = await fetch(val).then(res => res.json());
            } else {
                this.#geojson = val;
            }
            this.plot();
            this.style.visibility = "visible";
        })()
    }
    get geojson() { return this.#geojson }

    async plot() {
        await this[plotlyLib.label];
        const data = convertLineString(this.geojson);
        const { minx, miny, maxx, maxy } = getBounds(data);
        let layout;
        if (this.#initialized) {
            layout = { ...this.layout };
            layout.mapbox.center = { lat: (maxy + miny) / 2, lon: (maxx + minx) / 2 };
        } else {
            this.#initialized = true;
            layout = Object.assign(
                {
                    height: document.documentElement.clientHeight - 20,
                    legend: { title: { text: "name" }, tracegroupgap: 0 },
                    mapbox: {
                        center: { lat: (maxy + miny) / 2, lon: (maxx + minx) / 2 },
                        style: "carto-darkmatter",
                        zoom: autoZoom(minx, miny, maxx, maxy),
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

        Plotly.react(this, data, layout, { responsive: true });
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

function autoZoom(minx, miny, maxx, maxy) {
    const max = Math.max(maxx - minx, maxy - miny);
    return 12 - Math.log(max * 111)
}