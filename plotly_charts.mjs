export class PChart extends HTMLElement {
    constructor() {
        super();
        this.style.display = 'block';
    }
    connectedCallback() {
        this._setProperties();
        if (this.dataset.raw) {
            this.data = JSON.parse(this.dataset.raw);
        } else if (this.dataset.function) {
            const maybeFunctions = this.dataset.function.replaceAll(" ", "").split(",");
            this.data = [];
            maybeFunctions.forEach(fStr => {
                const f = window[fStr];
                if (!f || typeof f !== "function") return;
                this.data.push(this._genTrace(f, this.min, this.max, this.step));
            });

        } else if (this.dataset.factory) {
            this.params = [...this.querySelectorAll('[data-param]').values()];
            this.factory = window[this.dataset.factory];
            this._funcUpdate();
            this.addEventListener("input", e => {
                if ("param" in e.target.dataset) this._funcUpdate();
            })
            return;
        } else if (this.dataset.data) {
            this.params = [...this.querySelectorAll('[data-param]').values()];
            this._dataFunc = window[this.dataset.data];
            this._dataUpdate();
            this.addEventListener("input", e => {
                if ("param" in e.target.dataset) this._dataUpdate();
            })
        } else {
            return;
        }

        this._plot();

    }
    _setProperties() {
        const layout = this.dataset.layout;
        this.layout = layout ?
            window[layout] ?
                window[layout] :
                JSON.parse(layout) :
            null;

        const config = this.dataset.config;
        this.config = config ?
            window[config] ?
                window[config] :
                JSON.parse(config) :
            null;

        const attrMin = Number(this.dataset.min);
        this.min = attrMin ? attrMin : 0;

        const attrMax = Number(this.dataset.max);
        this.max = attrMax && attrMax > this.min ? attrMax : 1;

        const attrStep = Number(this.dataset.step);
        this.step = attrStep ? attrStep : 0.1;

    }
    _genTrace(f, min, max, step) {
        const trace = { x: [], y: [] };
        for (let i = min; i <= max; i += step) {
            trace.x.push(i);
            trace.y.push(f(i));
        }
        return trace;
    }
    _funcUpdate() {
        const f = this.factory(...this.params.map(p => p.value));
        this.data = [this._genTrace(f, this.min, this.max, this.step)];
        this._plot();
    }
    _dataUpdate() {
        this.data = this._dataFunc(...this.params.map(p => p.value));
        this._plot();
    }
    _plot() {
        if (!this._container) {
            this._container = document.createElement("div");
            this.insertAdjacentElement('afterbegin', this._container);
        }
        Plotly.newPlot(this._container, this.data, this.layout, this.config)
    }
}