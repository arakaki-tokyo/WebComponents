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