export function onInput(widgets, f) {
    const handler = (e) => f(e, ...(widgets.map(w => w.value)));
    widgets.forEach(w => w.addEventListener("input", handler));
}

export class Slider extends HTMLElement {
    connectedCallback() {
        this.style.display = "inline-block";
        const HTML = `
            <div style="display:flex;">
                <input type="range"></input><output></output>
            </div>
        `
        // append element in light or shadow dom-tree.
        const tree = "open" in this.attributes ? this : this.attachShadow({ mode: 'closed' });
        tree.innerHTML = HTML;

        this._input = tree.querySelector("input");
        this._output = tree.querySelector("output");

        // initialize input element
        [...this.attributes].forEach(({ name, value }) => this._input[name] = value);
        this._input.value = this.getAttribute("value");
        if (!this._input.min) this._input.min = 0;
        if (!this._input.max) this._input.max = 100;

        // initialize output element
        this._updateOutput();

        // event handler(input or change)
        const propagate = e => {
            this._updateOutput();
        }
        this._input.oninput = propagate;
        this._input.onchange = propagate;



    }
    _updateOutput() {
        this._output.innerHTML = this._input.value;
        const ratio = (i => (i.value - i.min) / (i.max - i.min) * 100)(this._input);
        const adjusted = 10 - 0.2 * ratio;
        this._output.style.left = `calc(${ratio}% + ${adjusted}px)`;
    }
    get value() { return this._input.value }
    set value(val) {
        this._input.value = val;
        this._input.dispatchEvent(new Event('input'));
    }
}

export class OutputFor extends HTMLElement {
    connectedCallback() {
        this.for = document.querySelector(this.dataset.for);

        const func = window[this.dataset.func];
        this.func = (func && typeof func === "function") ? func : arg => arg;

        [
            "input",
            "change"
        ].forEach(evtype => this.for.addEventListener(evtype, e => this._exec()));
        this._exec();
    }
    async _exec() {
        this.innerHTML = await this.func(this.for.value);
    }
}

export class SelectBox extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "closed" });
        this.select = document.createElement("select");
        for (const a of this.attributes) this.select.setAttribute(a.name, a.value);
        shadow.appendChild(this.select);

        if ('init' in this.dataset) this.init(this.dataset.init);

    }
    init(obj) {
        const seeds = obj.__proto__ === String.prototype ?
            JSON.parse(obj) : obj;

        const options = (seeds.__proto__ === Array.prototype) ?
            seeds.map(seed => [seed, seed]) : Object.entries(obj);

        let HTML = '';
        options.forEach(opt => HTML += `<option value="${opt[1]}">${opt[0]}</option>`)

        this.select.innerHTML = HTML;
    }

    set value(val) { this.select.value = val }
    get value() { return this.select.value }
}