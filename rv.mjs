const plotlyLib = {
    label: 'Plotly',
    src: "https://cdn.plot.ly/plotly-2.4.2.min.js"
};

const loadingSVG = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
    <circle cx="38" cy="50" fill="#1f77b4" r="12">
        <animate attributeName="cx" repeatCount="indefinite" dur="1s" keyTimes="0;0.5;1" values="38;62;38" begin="-0.5s"></animate>
    </circle>
    <circle cx="62" cy="50" fill="#ff7f0e" r="12">
        <animate attributeName="cx" repeatCount="indefinite" dur="1s" keyTimes="0;0.5;1" values="38;62;38" begin="0s"></animate>
    </circle>
    <circle cx="38" cy="50" fill="#1f77b4" r="12">
        <animate attributeName="cx" repeatCount="indefinite" dur="1s" keyTimes="0;0.5;1" values="38;62;38" begin="-0.5s"></animate>
        <animate attributeName="fill-opacity" values="0;0;1;1" calcMode="discrete" keyTimes="0;0.499;0.5;1" dur="1s" repeatCount="indefinite"></animate>
    </circle>
</svg>
`;

const widgets = await import('./widgets.mjs');

/**
 * base class for randam variables.
 * 
 * ## attributes
 *  - exec: string
 *      Function-name execute python code.
 * ## properties
 *  - initCode: string
 *      Must defined in order to initialize.
 *  - initialized: Promise
 *      Resolved when initCode executed. 
 */
class RV extends HTMLElement {
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
        this.exec = Function(`return ${this.getAttribute("exec")}`)();
        if (typeof (this.exec) !== 'function') {
            throw '"exec" attribute is required.';
        }

        Object.entries({
            display: "block",
        }).forEach(([key, val]) => this.style[key] = val);

        this.loadLibs(plotlyLib);

        this.loading = document.createElement("div");
        this.loading.innerHTML = loadingSVG;
        this.insertAdjacentElement("beforebegin", this.loading);

        this.initialized = new Promise(resolve => {
            setTimeout(() => {
                this.exec(this.initCode).then(() => resolve());
            }, 0);
        })

        this.initialized.then(() => this.loading.remove());
    }
}

export class Binomial extends RV {
    initCode = `
        import numpy as np
        from scipy.stats import binom
    `;

    async connectedCallback() {
        this.style.visibility = "hidden";

        if (customElements.get("w-slider") === undefined) {
            customElements.define("w-slider", widgets.Slider);
        }

        this.innerHTML = `
            <div data-role="plotContainer"></div>
            <p>n: <w-slider data-role="n" min=0 max=100 value=10></w-slider></p>
            <p>p: <w-slider data-role="p" min=0 max=1 step=0.02 value=0.5></w-slider></p>
        `;
        this.querySelectorAll("[data-role]").forEach(
            (elm) => (this[elm.dataset.role] = elm)
        );

        widgets.onInput(
            [this.n, this.p],
            (e, n, p) => this.plot(n, p)
        )
        this.initialized.then(() => {
            this.n.dispatchEvent(new Event("input"));
            this.style.visibility = "visible";
        })

        await this.Plotly;
        this.initPlot();
    }
    initPlot() {
        const data = [
            {
                name: "pmf(Probability mass function)",
                x: [],
                y: [],
                type: 'bar'
            },
            {
                name: "cdf(Cumulative Distribution Function)",
                type: 'scatter', mode: "lines+markers",
                x: [],
                y: [],
                yaxis: "y2"
            }
        ];

        const layout = {
            height: 500,
            yaxis: {
                title: "pmf",
                autorange: true,
                scaleanchor: 'x',
                scaleratio: 200,
                constraintoward: "bottom",
                titlefont: { color: '#1f77b4' },
                tickfont: { color: '#1f77b4' }
            },
            yaxis2: {
                title: "cdf",
                range: [0, 1.05],
                titlefont: { color: '#ff7f0e' },
                tickfont: { color: '#ff7f0e' },
                overlaying: 'y',
                side: "right",
            },
            legend: {
                orientation: "h",
                xanchor: "center",
                x: 0.5,
                yanchor: "bottom",
                y: 1,
            },
            updatemenus: [
                {
                    buttons: [
                        {
                            method: "relayout",
                            args: ["yaxis.scaleanchor", "x"],
                            label: "xy比固定"
                        },
                        {
                            method: "relayout",
                            args: ["yaxis.scaleanchor", ""],
                            label: "固定解除"
                        }
                    ],
                    xanchor: "right",
                    x: 0,
                    yanchor: "bottom",
                    y: 1.05
                }
            ],
            hovermode: "x",
            annotations: [{
                xref: "paper",
                x: 1,
                yref: "paper",
                y: -0,
                text: '',
                showarrow: false,
                bgcolor: 'rgba(0,0,0,0.5)',
                font: { color: 'white' }
            }]
        };

        const config = {
            'scrollZoom': true,
            responsive: true
        };

        Plotly.newPlot(this.plotContainer, data, layout, config)
    }
    async plot(n, p) {
        let result = await this.exec(`
            rv = binom(n=${n}, p=${p})
            x = np.arange(0, ${Number(n) + 1})
            pmf = rv.pmf(x)
            cdf = rv.cdf(x)
            {"x": x.tolist(), "pmf": pmf.tolist(), "cdf": cdf.tolist(), "mean": f'{rv.mean():.2f}', "std": f'{rv.std():.2f}'}
        `);

        const { x, pmf, cdf, mean, std } = Function(`return ${result}`)();

        const data = {
            x: [x],
            y: [pmf, cdf]
        }

        Plotly.update(this.plotContainer, data, { "annotations[0].text": `mean: ${mean}, std: ${std}` });
    }
}