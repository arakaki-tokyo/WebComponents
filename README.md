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
|   |   |   |
|---|---|---|
| open(read-only)  | boolean  | falseの場合にシャドウDOMツリーがアタッチされる。default = false  |

他、`<input type="range">`で利用可能な属性を受け取る。

#### example
<script defer type='module'>
    import { InputRange, OutputFor } from 'https://arakaki-tokyo.github.io/WebComponents/widgets.mjs';
    
    [	// Custom Elements definition
        { class: InputRange, name: "input-range" },
        { class: OutputFor, name: "output-for" },
    ].forEach(CE => customElements.define(CE.name, CE.class));
</script>

<input-range min=-10 max=10>