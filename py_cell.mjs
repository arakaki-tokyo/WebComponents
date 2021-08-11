(function insertStyle() {
    const style = document.createElement("style");
    style.innerHTML =
        // for pandas DaraFrame table
        `
        table.dataframe{
            border-collapse: collapse;
            border: none;
            font-size: 12px;
            border-color: transparent;
        }
        .dataframe thead{
            border-bottom: 1px solid gray;
        }
        .dataframe th, 
        .dataframe tr, 
        .dataframe td{
            text-align: right;
            padding: 0.5em 0.5em;
        }
        .dataframe tbody tr:nth-child(odd) {
            background: whitesmoke;
        }
        .dataframe tbody tr:hover {
            background: paleturquoise;
        }`
        // for matplotlib html5_canvas_backend v.0.18.0
        + `
        .fa::after{
            display: inline-block;
            height: 1rem;
            width: 1rem;
            background: #495057;
            transition-duration: 0.4s;
        }
        .fa:hover::after{
            background: #fff;
        }
        
        .fa-home::after {
            content: "";
            clip-path: url(#fa-home);
        }
        .fa-arrow-left::after {
            content: "";
            clip-path: url(#fa-arrow-left);
        }
        .fa-search-plus::after {
            content: "";
            clip-path: url(#fa-search-plus);
        }
        .fa-arrows::after {
            content: "";
            clip-path: url(#fa-arrows);
        }
        .fa-arrow-right::after {
            content: "";
            clip-path: url(#fa-arrow-right);
        }
        .matplotlib-icon{
            transform: scale(.6);
        }
        `;
    document.querySelector("head").appendChild(style);

    // for matplotlib html5_canvas_backend v.0.18.0
    document.body.insertAdjacentHTML("afterbegin", `
        <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <clipPath class="matplotlib-icon" id="fa-arrows" viewBox="0 0 28 28">
                    <path d="M28 14c0 0.266-0.109 0.516-0.297 0.703l-4 4c-0.187 0.187-0.438 0.297-0.703 0.297-0.547 0-1-0.453-1-1v-2h-6v6h2c0.547 0 1 0.453 1 1 0 0.266-0.109 0.516-0.297 0.703l-4 4c-0.187 0.187-0.438 0.297-0.703 0.297s-0.516-0.109-0.703-0.297l-4-4c-0.187-0.187-0.297-0.438-0.297-0.703 0-0.547 0.453-1 1-1h2v-6h-6v2c0 0.547-0.453 1-1 1-0.266 0-0.516-0.109-0.703-0.297l-4-4c-0.187-0.187-0.297-0.438-0.297-0.703s0.109-0.516 0.297-0.703l4-4c0.187-0.187 0.438-0.297 0.703-0.297 0.547 0 1 0.453 1 1v2h6v-6h-2c-0.547 0-1-0.453-1-1 0-0.266 0.109-0.516 0.297-0.703l4-4c0.187-0.187 0.438-0.297 0.703-0.297s0.516 0.109 0.703 0.297l4 4c0.187 0.187 0.297 0.438 0.297 0.703 0 0.547-0.453 1-1 1h-2v6h6v-2c0-0.547 0.453-1 1-1 0.266 0 0.516 0.109 0.703 0.297l4 4c0.187 0.187 0.297 0.438 0.297 0.703z"></path>
                </clipPath>
                <clipPath class="matplotlib-icon" id="fa-home" viewBox="0 0 26 28">
                    <path d="M22 15.5v7.5c0 0.547-0.453 1-1 1h-6v-6h-4v6h-6c-0.547 0-1-0.453-1-1v-7.5c0-0.031 0.016-0.063 0.016-0.094l8.984-7.406 8.984 7.406c0.016 0.031 0.016 0.063 0.016 0.094zM25.484 14.422l-0.969 1.156c-0.078 0.094-0.203 0.156-0.328 0.172h-0.047c-0.125 0-0.234-0.031-0.328-0.109l-10.813-9.016-10.813 9.016c-0.109 0.078-0.234 0.125-0.375 0.109-0.125-0.016-0.25-0.078-0.328-0.172l-0.969-1.156c-0.172-0.203-0.141-0.531 0.063-0.703l11.234-9.359c0.656-0.547 1.719-0.547 2.375 0l3.813 3.187v-3.047c0-0.281 0.219-0.5 0.5-0.5h3c0.281 0 0.5 0.219 0.5 0.5v6.375l3.422 2.844c0.203 0.172 0.234 0.5 0.063 0.703z"></path>
                </clipPath>
                <clipPath class="matplotlib-icon" id="fa-arrow-right" viewBox="0 0 23 28">
                    <path d="M23 15c0 0.531-0.203 1.047-0.578 1.422l-10.172 10.172c-0.375 0.359-0.891 0.578-1.422 0.578s-1.031-0.219-1.406-0.578l-1.172-1.172c-0.375-0.375-0.594-0.891-0.594-1.422s0.219-1.047 0.594-1.422l4.578-4.578h-11c-1.125 0-1.828-0.938-1.828-2v-2c0-1.062 0.703-2 1.828-2h11l-4.578-4.594c-0.375-0.359-0.594-0.875-0.594-1.406s0.219-1.047 0.594-1.406l1.172-1.172c0.375-0.375 0.875-0.594 1.406-0.594s1.047 0.219 1.422 0.594l10.172 10.172c0.375 0.359 0.578 0.875 0.578 1.406z"></path>
                </clipPath>
                <clipPath class="matplotlib-icon" id="fa-arrow-left" viewBox="0 0 25 28">
                    <path d="M24 14v2c0 1.062-0.703 2-1.828 2h-11l4.578 4.594c0.375 0.359 0.594 0.875 0.594 1.406s-0.219 1.047-0.594 1.406l-1.172 1.188c-0.359 0.359-0.875 0.578-1.406 0.578s-1.047-0.219-1.422-0.578l-10.172-10.187c-0.359-0.359-0.578-0.875-0.578-1.406s0.219-1.047 0.578-1.422l10.172-10.156c0.375-0.375 0.891-0.594 1.422-0.594s1.031 0.219 1.406 0.594l1.172 1.156c0.375 0.375 0.594 0.891 0.594 1.422s-0.219 1.047-0.594 1.422l-4.578 4.578h11c1.125 0 1.828 0.938 1.828 2z"></path>
                </clipPath>
                <clipPath class="matplotlib-icon" id="fa-search-plus" viewBox="0 0 26 28">
                    <path d="M16 12.5v1c0 0.266-0.234 0.5-0.5 0.5h-3.5v3.5c0 0.266-0.234 0.5-0.5 0.5h-1c-0.266 0-0.5-0.234-0.5-0.5v-3.5h-3.5c-0.266 0-0.5-0.234-0.5-0.5v-1c0-0.266 0.234-0.5 0.5-0.5h3.5v-3.5c0-0.266 0.234-0.5 0.5-0.5h1c0.266 0 0.5 0.234 0.5 0.5v3.5h3.5c0.266 0 0.5 0.234 0.5 0.5zM18 13c0-3.859-3.141-7-7-7s-7 3.141-7 7 3.141 7 7 7 7-3.141 7-7zM26 26c0 1.109-0.891 2-2 2-0.531 0-1.047-0.219-1.406-0.594l-5.359-5.344c-1.828 1.266-4.016 1.937-6.234 1.937-6.078 0-11-4.922-11-11s4.922-11 11-11 11 4.922 11 11c0 2.219-0.672 4.406-1.937 6.234l5.359 5.359c0.359 0.359 0.578 0.875 0.578 1.406z"></path>
                </clipPath>
            </defs>
        </svg>
    `)
})();

class PyCellOut extends HTMLElement {
    #isVisible = true;
    connectedCallback() {

        const shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>
                :host {
                    --bar-width: 7px;
                    display: block;
                    position: relative;
                    padding-left: calc(var(--bar-width) + 1em);
                }
                slot{
                    white-space: pre-wrap;
                    display: block;
                    overflow: auto;
                    padding-right: 1.5em;
                }
                [data-role="bar"] {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: var(--bar-width);
                    background: transparent;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: 100ms;
                }
                :host(:hover) [data-role="bar"]{
                    background: hsl(200, 100%, 60%);
                }
                [data-role="bar"]:hover{
                    background: hsl(200, 100%, 40%) !important;
                }
                svg{
                    padding: 5px;
                    width: 30px;
                    border-radius: 3px;
                    display: none;
                    margin: 1px auto;
                    cursor: pointer;
                }
                svg:hover {
                    border: solid 1px darkgray;
                    margin:0 auto;
                }


            </style>
            <slot data-role="theSlot"></slot>
            <div>
                <svg data-role="extend" fill="lightgray" width=30 id="bbb" viewBox="0 0 8 2">
                    <circle cx="1" cy="1" r="1"/>
                    <circle cx="4" cy="1" r="1"/>
                    <circle cx="7" cy="1" r="1"/>
                </svg>
            </div>
            <div data-role="bar"></div>
        `;
        shadow.querySelectorAll("[data-role]").forEach(elm => {
            this[elm.dataset.role] = elm;
        });

        this.bar.addEventListener('click', this.toggleVisibility.bind(this));
        this.extend.addEventListener('click', this.toggleVisibility.bind(this));
    }
    toggleVisibility() {
        this.isVisible = this.isVisible ^ true;
    }
    set isVisible(toVisualize) {
        if (toVisualize) {
            this.extend.style.display = "none";
            this.theSlot.style.display = "block";
        } else {
            this.extend.style.display = "block";
            this.theSlot.style.display = "none";
        }
        this.#isVisible = toVisualize
    }
    get isVisible() { return this.#isVisible }

}
customElements.define("py-cell-out", PyCellOut);
/**
 * Class python-cell like jupyter as Web Components
 * @extends HTMLElement
 */
export class PyCell extends HTMLElement {
    static executeCnt = 0
    connectedCallback() {
        this.style.display = "block";
        this.innerHTML = `
            <div style="position:relative">
                <pre style="box-sizing:border-box;"><code class="lang-py" data-role="code"> </code></pre>
                <textarea data-role="input" spellcheck="false" wrap="off">${this.innerHTML}</textarea>
            </div>
            <div style="display:flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between;">
                    <div data-role="executed"></div>
                    <div>
                        <button data-role="btnRun" style="position:relative;"><span data-role="loading"></span>Run</button>
                    </div>    
                </div>
                <py-cell-out data-role="out"></py-cell-out>
            </div>
        `;

        this.querySelectorAll("[data-role]").forEach(elm => {
            this[elm.dataset.role] = elm;
        });
        if (window.Prism) {
            Prism.highlightElement(this.code);
        }

        // styling
        const loadingCSS = {
            width: "1em",
            height: "1em",
            border: "solid 2px",
            display: "block",
            borderRadius: "50%",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            display: "none",
            color: "black",
            position: "absolute",
            left: "50%"
        }
        Object.entries(loadingCSS).forEach(([prop, value]) => this.loading.style[prop] = value);

        this.loading.animate(
            [
                { transform: 'translateX(-50%) rotate(0)', color: '#000' },
                { color: '#431236', offset: 0.3 },
                { transform: 'translateX(-50%) rotate(360deg)', color: '#000' }
            ], {
            duration: 1000,
            iterations: Infinity
        }
        );

        const executedCSS = {
            color: "gray",
        }
        Object.entries(executedCSS).forEach(([prop, value]) => this.executed.style[prop] = value);

        const inputCSS = {
            display: "block",
            resize: "none",
            position: "absolute",
            top: 0,
            left: 0,
            boxSizing: "border-box",
            width: "100%",
            background: "transparent",
            color: "transparent",
            caretColor: "black",
            border: "solid 1px",
            padding: "1em",
            paddingLeft: `${this.code.parentElement.classList.contains("line-numbers") ? "3.8em" : "1em"}`,
            fontFamily: "Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace",
            fontSize: "1em",
            lineHeight: 1.5,
            overflowY: "hidden"
        }
        if (!window.Prism) {
            inputCSS.background = "";
            inputCSS.color = "";
        }
        Object.entries(inputCSS).forEach(([prop, value]) => this.input.style[prop] = value);


        // add EventListener
        this.input.addEventListener("input", this.inputOninput.bind(this))
        this.input.addEventListener("scroll", this.inputOnscroll.bind(this))
        this.btnRun.addEventListener("click", this.btnOnclick.bind(this))

        // initialize
        this.input.dispatchEvent(new Event("input"));

        this.useWorker = ("useWorker" in this.dataset && this.dataset.useWorker !== "false");
        if ((Function(`try{return typeof ${this.dataset.pyodide}}catch(e){return "undefined"}`)()) !== "undefined") {
            this.Pyodide = Function(`return ${this.dataset.pyodide}`)();

            if ("execute" in this.dataset && this.dataset.execute != "false") {
                this.btnRun.dispatchEvent(new Event("click"));
            }
        } else {
            if ("pyodide" in this.dataset) {
                this.out.innerHTML = `${this.dataset.pyodide} is not in global.`
            } else {
                if (this.useWorker) {
                    this.out.innerHTML = "'data-pyodide' attribute is not given."
                } else {
                    // worker未使用の場合にはdata-pyodide属性はなくてもいい
                    this.Pyodide = Promise.resolve(false);

                    return;
                }

            }
            this.btnRun.disabled = true;
        }

    }
    calcHeight() {
        const lineCnt = (this.input.value + "\n").match(/\n/g).length;
        const CSS = getComputedStyle(this.input);
        const height =
            parseInt(CSS.lineHeight, 10) * lineCnt
            + parseInt(CSS.paddingTop, 10)
            + parseInt(CSS.paddingBottom, 10)
            + 17; // 横スクロールバーがあると最終行が狭まる。回避困難なので予め余裕をもっとく

        this.input.style.height = this.code.parentElement.style.height = `${height}px`;
    }
    write(s) {
        this.out.innerText += s;
    }

    /**
     * pythonスクリプト入力欄の制御。以下の処理を実行する。
     *  - 改行時にインデントを引き継ぐ
     *  - シンタックスハイライトを更新する
     *  - 入力欄とシンタックスハイライト表示領域の高さを更新する
     * 
     * @param {*} e
     * @memberof PyCell
     */
    inputOninput(e) {
        // キー入力の挙動と衝突しないように0-timeout
        setTimeout(() => {
            // 改行時にインデントを引き継ぐ
            if (e.inputType === "insertLineBreak") {
                const position = e.target.selectionStart;
                const precedings = e.target.value.slice(0, position - 1);
                const lastLineHead = precedings.lastIndexOf('\n') + 1;

                let thisLineHead = '\n';
                let cnt = 0;
                while (precedings[lastLineHead + cnt] == ' ') cnt++, thisLineHead += " ";

                e.target.value = precedings + thisLineHead + e.target.value.substring(position);

                e.target.selectionStart = position + cnt;
                e.target.selectionEnd = position + cnt;
            }

            // シンタックスハイライト
            // 末尾の改行は削除される。preのheightやline-numberの不整合を防ぐために改行を保持させる
            if (window.Prism) {
                const code = `${e.target.value}${(e.target.value.at(-1) ?? '\n') === '\n' ? " " : ""}`;
                this.code.innerHTML = code.replaceAll("<", "&lt;");
                Prism.highlightElement(this.code);
            }

            // 高さ計算
            this.calcHeight();
        }, 0)
    }

    inputOnscroll(e) {
        this.code.parentElement.scrollLeft = this.input.scrollLeft;
        this.code.parentElement.scrollTop = this.input.scrollTop;

    }
    async btnOnclick(e) {
        e.target.disabled = true;
        e.target.style.color = "transparent";
        this.loading.style.display = "block";

        try {
            this.out.innerHTML = "";
            if (this.useWorker) {
                const { results, log } = await this.Pyodide(this.input.value);
                this.write(log);
                this.out.appendChild(this.strToElm(results));

            } else {
                const pyodide = await this.Pyodide || window.pyodide;
                await pyodide.runPythonAsync('if not "sys" in dir(): import sys');
                const sys = pyodide.globals.get('sys');
                sys.stdout = this;

                const results = await pyodide.runPythonAsync(this.input.value);
                sys.destroy();

                if (results !== undefined) {
                    if (pyodide.isPyProxy(results) && "_repr_html_" in results) {
                        this.out.appendChild(this.strToElm(results._repr_html_()));
                    } else {
                        this.out.appendChild(this.strToElm(results));
                    }
                }
                if (document.body.lastElementChild.id.startsWith("matplotlib")) {
                    this.out.appendChild(document.body.lastElementChild);
                }
            }
            this.out.isVisible = true;

        } catch (e) {
            this.write(e);
        }
        // update style of btnRun and executed
        e.target.disabled = false;
        e.target.style.color = "";
        this.loading.style.display = "none";
        this.executed.innerHTML = `[${this.constructor.executeCnt += 1}]`;

    }
    strToElm(str) {
        const container = document.createElement("div");
        container.style.whiteSpace = "initial";
        container.innerHTML = str
            .replaceAll(/<\/?html.*?>/g, "")
            .replaceAll(/<\/?head.*?>/g, "")
            .replaceAll(/<meta.*?>/g, "")
            .replaceAll(/<title>.*<\/title>/g, "");

        let outerScriptId = '';
        container.querySelectorAll("script").forEach(s => {
            const newScript = document.createElement("script");

            for (let i = 0; i < s.attributes.length; i++)
                newScript.setAttribute(s.attributes[i].name, s.attributes[i].value);

            if (newScript.hasAttribute("src")) {
                outerScriptId = Date.now();
                newScript.setAttribute("id", outerScriptId);
            } else if (outerScriptId && newScript.type !== 'application/json') {
                newScript.innerText = `
                    document.getElementById('${outerScriptId}')
                    .addEventListener('load', ()=>{${s.innerText}})`;
            } else {
                newScript.innerText = s.innerText;
            }

            s.replaceWith(newScript);
        })
        return container
    }
}