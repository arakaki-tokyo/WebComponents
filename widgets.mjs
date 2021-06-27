export class InputRange extends HTMLElement {
    connectedCallback() {
        this._input = document.createElement("input");
        this._output = document.createElement("output");

        this._input.setAttribute("type", "range");
        [...this.attributes].forEach(({ name, value }) => this._input.setAttribute(name, value));

        const propagate = e => {
            this.dispatchEvent(new Event(e.type, { bubbles: true }));
            this._output.innerHTML = e.target.value;
        }
        this._input.oninput = propagate;
        this._input.onchange = propagate;

        this._shadowRoot = this.attachShadow({ mode: 'closed' });
        [this._input, this._output].forEach(node => this._shadowRoot.appendChild(node));
        this._input.dispatchEvent(new Event('input'));

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
        ].forEach(evtype => this.for.addEventListener(evtype, e => this.innerHTML = this.func(e.target.value)));
        this.innerHTML = this.func(this.for.value);
    }
}