export function onInput(widgets, f) {
    const handler = (e) => f(e, ...(widgets.map(w => w.value)));
    widgets.forEach(w => w.addEventListener("input", handler));
}

export class InputRange extends HTMLElement {
    _open = false;
    connectedCallback() {
        this._input = document.createElement("input");
        this._output = document.createElement("output");

        // initialize input element
        this._input.setAttribute("type", "range");
        [...this.attributes].forEach(({ name, value }) => this._input.setAttribute(name, value));

        // initialize output element
        this._updateOutput();

        // event handler(input or change)
        const propagate = e => {
            this.dispatchEvent(new Event(e.type, { bubbles: true }));
            this._updateOutput();
        }
        this._input.oninput = propagate;
        this._input.onchange = propagate;

        // append element in light or shadow dom-tree.
        if ("open" in this.attributes) {
            this._open = true;
            this.appendChild(this._input);
            this.appendChild(this._output);
        } else {
            const shadowRoot = this.attachShadow({ mode: 'closed' });
            shadowRoot.appendChild(this._input);
            shadowRoot.appendChild(this._output);
        }


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
    get open() { return this._open }
    set open(val) { }
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