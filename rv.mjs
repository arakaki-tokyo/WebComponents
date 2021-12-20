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

    connectedCallback() {
        this.style.display = "none";

        if (customElements.get("w-slider") === undefined) {
            customElements.define("w-slider", widgets.InputRange);
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
            this.style.display = "block";
        })
    }

    async plot(n, p) {
        let result = await this.exec(`
            rv = binom(n=${n}, p=${p})
            x = np.arange(0, ${Number(n) + 1})
            pmf = rv.pmf(x)
            cdf = rv.cdf(x)
            {"x": x.tolist(), "pmf": pmf.tolist(), "cdf": cdf.tolist()}
        `);

        const { x, pmf, cdf } = Function(`return ${result}`)();

        const data = [
            {
                name: "pmf(Probability mass function)",
                x,
                y: pmf,
                type: 'bar'
            },
            {
                name: "cdf(Cumulative Distribution Function)",
                type: 'scatter', mode: "lines+markers",
                x,
                y: cdf,
                yaxis: "y2"
            }
        ];

        const layout = {
            height: 500,
            margin: { b: 0 },
            yaxis: {
                title: "pmf",
                autorange: true,
                scaleanchor: 'x',
                scaleratio: 20,
                constraintoward: "bottom",
                titlefont: { color: '#1f77b4' },
                tickfont: { color: '#1f77b4' }
            },
            yaxis2: {
                title: "cdf",
                range: [0, 1.1],
                titlefont: { color: '#ff7f0e' },
                tickfont: { color: '#ff7f0e' },
                overlaying: 'y',
                side: "right",
            },
            legend: {
                orientation: "h",
                y: 1,
                yanchor: "bottom"
            }
        };

        const config = {
            'scrollZoom': true,
            responsive: true
        };

        Plotly.react(this.plotContainer, data, layout, config);
    }
}