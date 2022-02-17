class RenameData {
    /**@type {File} */file;
    newName;
    ignore;
    constructor(file, newName = "", ignore = false) {
        this.file = file;
        this.newName = newName;
        this.ignore = ignore;
    }

    get name() { return this.file.name }
}

/**
 * @class RenameAll
 */
export class RenameAll extends HTMLElement {
    elms = {
        /** @type {HTMLElement} */controll: null,
        /** @type {HTMLElement} */dirPicker: null,
        /** @type {HTMLElement} */dirName: null,
        /** @type {HTMLElement} */exec: null,
        /** @type {FileList} */fileList: null,
    };
    /**@type {Array} */confElms;
    conf = {
        method: "seq",
        prefix: "",
        suffix: "",
        init: "1",
        step: "1",
        width: "1",
        ext: false,
        custom: ""
    };
    /**@type {FileSystemDirectoryHandle} */ dirHandle;
    /**@type {FileSystemDirectoryHandle} */ outDir;
    /**@type {Array<RenameData>} */ renames = [];
    /**@type {Array<FileSystemDirectoryHandle>} */ dirs = [];
    /**
     * @property {String} key
     * @property {Number} dir 1:asc, -1:desc
     */
    order = {
        key: "name",
        dir: 1
    }

    connectedCallback() {
        customElements.define("show-files", FileList);

        const shadow = this.attachShadow({ mode: "closed" });
        shadow.innerHTML = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
            <style>
                table ::-webkit-scrollbar {
                    width: 1px;
                    height: 1px;
                    background: transparent;
                }
                table ::-webkit-scrollbar-thumb {
                    background: hsla(0, 0%, 0%, 0.7);
                }
                :host{
                    display: block;
                }
                input[type="number"] {
                    width: 100px;
                    box-sizing: initial;
                }
                button[data-role="dirPicker"] svg {
                    fill: currentColor;
                }
            </style>
            <div class="box">
                <div data-role="controll" class="block">
                    <div class="field has-addons">
                        <p class="control">
                            <button data-role="dirPicker" class="has-text-weight-bold button is-small is-link">
                                <span>フォルダ選択</span>
                                <span class="icon mr-1">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                        <path d="M26 30l6-16h-26l-6 16zM4 12l-4 18v-26h9l4 4h13v4z"></path>
                                    </svg>
                                </span>
                            </button>
                        <p>
                        <p class="control">
                            <span class="button is-small" data-role="dirName" style="cursor: auto;"></span>
                        </p>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-label">
                            <label class="radio">
                                連番
                                <input data-conf="method" data-conf-method type="radio" class="radio" name="method" value="seq" disabled checked>
                            </label> 
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <label class="label is-small">プレフィックス</label>
                                <div class="control">
                                    <input data-conf="prefix" data-conf-seq type="text" class="input is-small" disabled>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label is-small">サフィックス</label>
                                <div class="control">
                                    <input data-conf="suffix" data-conf-seq type="text" class="input is-small" disabled>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-label"></div>
                        <div class="field-body">
                            <div class="field">
                                <label class="label is-small">初期値</label>
                                <div class="control">
                                    <input data-conf="init" data-conf-seq type="number" class="input is-small" value='1' disabled>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label is-small">ステップ</label>
                                <div class="control">
                                    <input data-conf="step" data-conf-seq type="number" class="input is-small" value='1' disabled>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label is-small">最少桁数</label>
                                <div class="control">
                                    <input data-conf="width" data-conf-seq type="number" class="input is-small" value='1' disabled>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-label"></div>
                        <div class="field-body">
                            <label class="is-flex is-align-items-center checkbox">
                                <span class="has-text-weight-bold is-size-7 pr-2">拡張子を含める</span>
                                <input data-conf="ext" data-conf-seq type="checkbox" disabled>
                            </label>
                        </div>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-label">
                            <label class="radio">
                                カスタム
                                <input data-conf="method" data-conf-method type="radio" class="radio" name="method" value="custom" disabled>
                            </label> 
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <div class="control">
                                    <div class="help">
                                        <p><a href="https://developer.mozilla.org/ja/docs/Web/API/File">File</a>オブジェクトの配列で<a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/map">map()メソッド</a>を実行する際の引数を記述してください。</p>
                                        例：<code>function(f){ this.c++; return \`\${this.c}_\${f.name}\` }, {c: 0}</code>
                                    </div>
                                        <textarea data-conf="custom" data-conf-custom rows="3" class="textarea" disabled></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-label">
                            <p><button data-role="exec" class="has-text-weight-bold button is-small is-success" disabled>実行</button></p>
                        </div>
                        <div class="field-body">
                        </div>
                    </div>
                </div>
                <div>
                    <show-files data-role="fileList" style="display: block; overflow: auto;"></show-files>
                </div>
            </div>
        `;
        shadow.querySelectorAll("[data-role]").forEach(elm => {
            this.elms[elm.dataset.role] = elm;
        });

        // set Style
        shadow.querySelector("link").onload = () => this.elms.fileList.style.height =
            `calc(${document.documentElement.clientHeight}px - ${getComputedStyle(this.elms.controll).height} - ${getComputedStyle(this.elms.controll).marginBottom})`;

        // Add Event Listener
        // -----------------
        // コントロール関連
        // -----------------
        this.confElms = shadow.querySelectorAll("[data-conf]");
        this.confMethodElms = shadow.querySelectorAll("[data-conf-method]");
        this.confSeqElms = shadow.querySelectorAll("[data-conf-seq]");
        this.confCustomElms = shadow.querySelectorAll("[data-conf-custom]");

        // inputイベントが発火したらthis.confを更新して変更後ファイル名も更新する
        this.confElms.forEach(elm => {
            elm.addEventListener("input", e => {
                if (elm.type === "checkbox") {
                    this.conf[elm.dataset.conf] = elm.checked;
                }
                else {
                    this.conf[elm.dataset.conf] = elm.value;
                }
                this.updateName();
            })
        });

        // 「連番」or「カスタム」の選択で該当の部品のみenableとする
        this.confMethodElms.forEach(elm => {
            elm.addEventListener("input", e => {
                const elms = [this.confSeqElms, this.confCustomElms];
                if (e.target.value === "seq") elms.reverse();

                elms[0].forEach(elm => elm.disabled = true)
                elms[1].forEach(elm => elm.disabled = false)
            })
        })

        // フォルダ選択
        this.elms.dirPicker.addEventListener("click", this.pickDir.bind(this));
        // 実行
        this.elms.exec.addEventListener("click", this.clickExec.bind(this));

        // -----------------
        // ファイルリスト関連
        // -----------------        
        // 「除外」選択
        this.elms.fileList.addEventListener("ignore", e => {
            this.renames.find(d => d.name === e.detail.name).ignore = e.detail.value;
            this.updateName();
        })

        // ソート
        this.elms.fileList.addEventListener("sort", e => {
            if (this.order.key === e.detail.key) {
                this.order.dir *= -1;
            } else {
                this.order.key = e.detail.key;
                this.order.dir = 1;
            }
            this.sort();
            this.listFiles();
            this.updateName();
        })
    }

    async pickDir(e) {
        try {
            this.dirHandle = await window.showDirectoryPicker();
            this.printDirname();
            await this.extractFiles();
            this.sort();
            this.listFiles();
            this.initInputs();

        } catch (e) {
            console.log(e);
            return;
        }

    }
    initInputs() {
        [...this.confElms, this.elms.exec].forEach(elm => elm.disabled = false);

        const widthInput = Array.from(this.confElms).find(e => e.dataset.conf === "width");
        this.conf.width = widthInput.value = this.renames.length.toString().length;

        const seq = [...this.confMethodElms].find(e => e.value === "seq")
        seq.checked = true;
        seq.dispatchEvent(new Event("input"));
    }

    async clickExec() {
        this.isProsessing(true);

        try {
            const newNames = this.renames.map(d => d.ignore ? d.name : d.newName);
            if (newNames.includes("")) {// 空文字チェック
                const idx = newNames.findIndex(name => name === "");
                alert(`「${this.renames[idx].name}」の変更後ファイル名が無効です！`);
            } else if ((new Set(newNames)).size !== this.renames.length) {// 重複チェック
                const duplicates = Array.from(new Set(newNames.filter((n, i, self) => self.lastIndexOf(n) !== i)));
                alert(`変更後ファイル名${duplicates.reduce((acc, n) => `${acc}「${n}」`, "")}が重複しています！`);
            } else {
                await this.makeOutputDir();

                const promises = this.renames.map((d, idx) => this.cpFile(d.file, newNames[idx]));
                await Promise.all(promises);
            }
        } catch (err) {
            console.log(err);
        }
        this.isProsessing(false);
    }

    async cpFile(file, name) {
        try {
            const writer = await this.outDir.getFileHandle(name, { create: true }).then(fh => fh.createWritable());
            await file.stream().pipeTo(writer);
        } catch (err) {
            alert(`「${file.name}」(変更後：${name})の処理に失敗しました。\n\n${err.message}`)
        }
    }

    async makeOutputDir() {
        await this.extractDirs();
        const baseName = "変換後";
        let outName = baseName;
        const names = this.dirs.map(d => d.name);

        for (let i = 1; names.includes(outName); i++) {
            outName = `${baseName} (${i})`;
        }

        this.outDir = await this.dirHandle.getDirectoryHandle(outName, { create: true });
    }

    printDirname(name) {
        this.elms.dirName.innerHTML = this.dirHandle.name;
    }

    async extractFiles() {
        this.renames = [];
        const promises = [];
        for await (const entry of this.dirHandle.values()) {
            if (entry.kind !== 'file') continue;
            promises.push(entry.getFile().then(file => this.renames.push(new RenameData(file))));
        }
        await Promise.all(promises);
    }

    async extractDirs() {
        this.dirs = [];

        for await (const entry of this.dirHandle.values()) {
            if (entry.kind == 'file') { continue }
            this.dirs.push(entry);
        }
    }

    sort() {
        if (this.order.key === "name") {
            this.renames.sort((a, b) => this.order.dir * (a.name.localeCompare(b.name)))
        } else {
            this.renames.sort((a, b) => this.order.dir * (a.file[this.order.key] - b.file[this.order.key]))
        }
    }
    listFiles() {
        this.elms.fileList.files = [this.renames, this.order];
    }

    updateName() {
        const c = this.conf;
        const files = this.renames.filter(d => !d.ignore);

        if (c.method === "seq") {
            const ext = c.ext ? () => "" : f => f.name.slice(f.name.indexOf("."));
            const w = Number(c.width);
            const step = Number(c.step);
            const n = i => `${i.toString().padStart(w, "0")}`;
            let i = Number(c.init);

            files.forEach(file => {
                file.newName = `${c.prefix}${n(i)}${c.suffix}${ext(file)}`;
                i += step;
            })

        } else if (c.method === "custom") {
            let newnames;
            try {
                newnames = files.map(d => d.file).map(...Function(`return [${c.custom}]`)());
            } catch (e) {
                newnames = Array(files.length);
                newnames.fill("");
            }
            files.forEach((f, idx) => f.newName = newnames[idx]);
        }

        this.elms.fileList.renames = this.renames;
    }

    isProsessing(b) {
        this.elms.exec.classList[b ? "add" : "remove"]("is-loading");
    }

}
/**
 * ## Events
 * ### ignore: `{type: "ignore", detail: {value, name}}`
 *  - detail.value {Boolean}
 *  - detail.name {String}: file name
 * 
 * ### sort: `{type: "sort", detail: {key}}`
 *  - detail.key{String}: "name" or "lastModified" or "size"
 */
class FileList extends HTMLElement {
    elms = {
        /** @type {HTMLElement} */fileContainer: null,
    }
    eSortKeys = {
        /** @type {HTMLElement} */name: null,
        /** @type {HTMLElement} */lastModified: null,
        /** @type {HTMLElement} */size: null,
    }
    connectedCallback() {
        this.innerHTML = `
            <style>
                table{
                    table-layout: fixed;
                    counter-reset: num;
                    border-collapse: separate;
                }
                th{
                    position: sticky;
                    top: 0;
                    background: white;
                }
                .name, .rename{
                    overflow-x: scroll;
                    white-space: nowrap;
                }
                .rename{
                    font-weight: bold;
                }
                .lastmodified{ 
                    box-sizing: initial;
                    width:110px;
                }
                .size{
                    box-sizing: initial;
                    width: 60px;
                }
                td.size{
                    text-align: right !important;
                }
                .num{
                    box-sizing: initial;
                    width: 20px;
                    text-align: right !important;
                }
                td.num::before{
                    counter-increment: num;
                    content: counter(num);
                }
                .ignore{
                    box-sizing: initial;
                    width: 25px;
                    text-align: center !important;
                    vertical-align: middle !important;
                }
                .ignore input{
                    position: initial;
                }
                .ignore-data *{
                    background: lightgray !important;
                }
                .invalid{
                    background: pink;
                }
                .sort-radio {
                    display: none;
                }

                th[data-sort]{
                    cursor: pointer;
                }
                .sort-radio:checked + .sort-key::after{
                    content: "";
                    display: inline-block;
                    width: .7rem;
                    height: .7rem;
                }
                .asc > .sort-radio:checked + .sort-key::after{
                    background: url('data:image/svg+xml,<svg%20version="1.1"%20xmlns="http://www.w3.org/2000/svg"%20width="32"%20height="32"%20viewBox="0%200%2032%2032"><title>sort-amount-asc</title><path%20d="M10%2024v-24h-4v24h-5l7%207%207-7h-5z"></path><path%20d="M14%2018h18v4h-18v-4z"></path><path%20d="M14%2012h14v4h-14v-4z"></path><path%20d="M14%206h10v4h-10v-4z"></path><path%20d="M14%200h6v4h-6v-4z"></path></svg>') no-repeat;
                    background-size: contain;   
                }
                .desc > .sort-radio:checked + .sort-key::after{
                    background: url('data:image/svg+xml,<svg%20version="1.1"%20xmlns="http://www.w3.org/2000/svg"%20width="32"%20height="32"%20viewBox="0%200%2032%2032"><title>sort-amount-desc</title><path%20d="M10%2024v-24h-4v24h-5l7%207%207-7h-5z"></path><path%20d="M14%200h18v4h-18v-4z"></path><path%20d="M14%206h14v4h-14v-4z"></path><path%20d="M14%2012h10v4h-10v-4z"></path><path%20d="M14%2018h6v4h-6v-4z"></path></svg>') no-repeat;
                    background-size: contain;   
                }
            </style>
            <table class="table is-striped is-narrow is-hoverable is-fullwidth is-size-7">
            <thead>
                <tr>
                    <th class="ignore">除外</th>
                    <th class="num">No.</th>
                    <th class="rename">変更後</th>
                    <th data-sort="name" class="name">
                        <input type="radio" class="sort-radio" name="sort">
                        <span class="sort-key">名前</span>
                    </th>
                    <th data-sort="lastModified" class="lastmodified">
                        <input type="radio" class="sort-radio" name="sort">
                        <span class="sort-key">最終更新日時</span>
                    </th>
                    <th data-sort="size" class="size">
                        <input type="radio" class="sort-radio" name="sort">
                        <span class="sort-key">サイズ</span>
                    </th>
                </tr>
            </thead>
            <tbody data-role="fileContainer"></tbody>
            </table>
        `;

        this.querySelectorAll("[data-role]").forEach(elm => this.elms[elm.dataset.role] = elm);
        this.querySelectorAll("[data-sort]").forEach(elm => this.eSortKeys[elm.dataset.sort] = elm);
        Object.entries(this.eSortKeys).forEach(([k, elm]) => {
            elm.addEventListener(
                "click",
                () => {
                    if (this.elms.fileContainer.innerHTML === '') return;
                    this.dispatchEvent(
                        new CustomEvent("sort", { bubbles: true, detail: { key: k } })
                    )
                }
            )

        })
    }
    /** @param {Array<RenameData>} files */
    set files([files, order]) {
        // 昇順／降順アイコンの表示
        const setClass = ["asc", "desc"];
        if (order.dir === -1) setClass.reverse();

        this.eSortKeys[order.key].classList.add(setClass[0]);
        this.eSortKeys[order.key].classList.remove(setClass[1]);

        this.eSortKeys[order.key].querySelector('input').checked = true;

        // テーブル更新
        this.elms.fileContainer.innerHTML = "";
        files.forEach(f => {

            this.elms.fileContainer.insertAdjacentHTML(
                "beforeend",
                `
                <tr class="${f.ignore ? "ignore-data" : ""}">
                    <td class="ignore">
                        <span class="is-flex is-justify-content-center">
                            <input class="checkbox" type="checkbox" ${f.ignore ? "checked" : ""} value="${f.name}">
                        </span>
                    </td>
                    <td class="num"></td>
                    <td class="rename"></td>
                    <td class="name">${f.name}</td>
                    <td class="lastmodified">${this.formatDate(f.file.lastModified)}</td>
                    <td class="size">${this.formatUnit(f.file.size)}</td>
                <tr>`
            )
        })

        // 変更後ファイル名を表示するエレメントの確保
        this.eRenames = this.elms.fileContainer.querySelectorAll(".rename");
        // 「除外」のチェックボックスにAdd Event Listenler
        this.elms.fileContainer.querySelectorAll("input[type='checkbox']").forEach(e => {
            e.addEventListener("input", () => {
                this.dispatchEvent(new CustomEvent(
                    "ignore", { bubbles: true, detail: { value: e.checked, name: e.value } }
                ))
            })
        });


    }

    /** @param {Array<RenameData>} renames */
    set renames(renames) {
        if (this.eRenames.length != renames.length) throw new Error();

        for (let i = 0; i < renames.length; i++) {
            if (renames[i].ignore) { // 除外？
                this.eRenames[i].innerHTML = "";
                this.eRenames[i].closest("tr").classList.add("ignore-data");
            } else {
                if (renames[i].newName === "") { // 空文字なら無効なファイル名クラスを付加
                    this.eRenames[i].classList.add("invalid");
                } else {
                    this.eRenames[i].classList.remove("invalid");
                }
                this.eRenames[i].innerHTML = renames[i].newName;
                this.eRenames[i].closest("tr").classList.remove("ignore-data");
            }

        }

    }

    formatDate(timeStamp) {
        const date = new Date(timeStamp);
        const Y = date.getFullYear().toString();
        const m = date.getMonth().toString().padStart(2, "0");
        const d = date.getDate().toString().padStart(2, "0");
        const H = date.getHours().toString().padStart(2, "0");
        const M = date.getMinutes().toString().padStart(2, "0");
        const S = date.getSeconds().toString().padStart(2, "0");

        return `${Y}/${m}/${d} ${H}:${M}`;
    }

    formatUnit(n) {
        let q = n;
        const UNITS = ["", "K", "M", "G"];
        for (let u of UNITS) {
            if (q < 1024) {
                return `${q} ${u}B`;
            }
            q = Math.floor(q / 1024);
        }
    }


}
