# WebComponents

## widgets
### InputRange 
`<input type="range">`の薄いラッパー。入力された値を表示する。
`open`属性を付けるとドキュメントからスタイルを適用することができる。
#### usage
`js`
```js
import { InputRange } from 'widgets.mjs';
customElements.define("input-range", InputRange);
```
`html`
```html
<input-range min=-10 max=10 value=0></input-range>
```

#### attributes
| name  | description  |
|---|---|
| open(read-only)  | boolean: falseの場合にシャドウDOMツリーがアタッチされる。default = false  |

他、`<input type="range">`で利用可能な属性を受け取る。

#### example
[widgets example #inputrange](https://arakaki.tokyo/widgets-example/#inputrange)

### OutputFor
#### usage
`js`
```js
import { OutputFor } from './widgets.mjs';
customElements.define("output-for", OutputFor);
```
`html`
```html
<input type="text">
<output-for data-for='input[type="text"]'>
```

#### attributes
| name  | description  |
|---|---|
| data-func  | DOMString: グローバルスコープで参照できる関数名。指定したinput要素のvalueを引数に取り、戻り値が表示される。  |

#### example
[widgets example](https://arakaki.tokyo/widgets-example/#outputfor)


## PyCell
- jupyterのようにpythonスクリプトを実行して結果を表示する
- [Prism](https://prismjs.com/index.html)が利用可能な場合、シンタックスハイライトが適用される
### usage
see example

### attributes
| name  | description  |
|---|---|
| data-use-worker  | boolean: pyodideがworkerスレッドで実行されるかどうか。 default = false |
| data-pyodide  | DOMString: pyodideがメインスレッドで実行される場合、[pyodideオブジェクト](https://pyodide.org/en/stable/usage/api/js-api.html#globalThis.pyodide)で解決するグローバルなプロミスの名前。optional。省略した場合、pythonスクリプトの実行時にグローバルなpyodideオブジェクトがあることを保証するのはユーザーの責任です。また、`execute`属性は無視されます。pyodideがworkerスレッドで実行される場合、pythonスクリプトを引数に取り実行結果のプロミスを返すグローバルな関数の名前。required。pythonの実行が成功した場合、結果は`{log, results}`で解決され、失敗した場合は`{error}`でリジェクトされる必要があります。 |
| data-execute  | boolean: ページ読み込み時に自動でpythonスクリプトを実行する。 default = false |

### example
- [workerを使わない例](example/py-cell/cells.html)
- [workerを使う例](example/py-cell/cells_useworker.html)
- [解説](https://arakaki.tokyo/pycell-example/)
