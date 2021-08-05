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
            <div style="display:flex;">
                <div style="margin-right:3px;">
                    <div>
                        <button data-role="btnRun" style="position:relative;"><span data-role="loading"></span>Run</button>
                    </div>    
                    <div data-role="executed"></div>
                </div>
                <pre data-role="out"></pre>
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
            textAlign: "center",
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

        const outputCSS = {
            border: "solid 1px black",
            flexGrow: "1",
            margin: "0",
            minHeight: "30px",
            fontFamily: "Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace",
            padding: "1em",
            fontSize: "1em",
            lineHeight: 1.3,
            overflow: "scroll"
        }
        Object.entries(outputCSS).forEach(([prop, value]) => this.out.style[prop] = value);


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
        this.out.innerHTML += s;
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
                this.code.innerHTML = e.target.value + (e.target.value.at(-1) === '\n' ? " " : "");
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
            if (this.useWorker) {
                const { results, log } = await this.Pyodide(this.input.value);
                this.out.innerHTML = log + (results ? results : "");
            } else {
                this.out.innerHTML = "";
                const pyodide = await this.Pyodide || window.pyodide;
                await pyodide.runPythonAsync('if not "sys" in dir(): import sys');
                const sys = pyodide.globals.get('sys');
                sys.stdout = this;

                const output = await pyodide.runPythonAsync(this.input.value);
                if (output) this.write(output);
            }

        } catch (e) {
            this.out.innerHTML = e;
        }
        e.target.disabled = false;
        e.target.style.color = "";
        this.loading.style.display = "none";
        this.executed.innerHTML = `[${this.constructor.executeCnt += 1}]`;

    }
}