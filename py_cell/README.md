## PyCell
- pythonスクリプトを編集・実行して結果を表示する
- [highlight\.js](https://highlightjs.org/)のスタイルシートを利用する

### dependencies
- highlight.js: ^11.2.0

### usage
- [解説](https://arakaki.tokyo/pycell-example/)

### attributes
| name  | description  |
|---|---|
| data-highlight | boolean: highlight.jsのスタイルを適用するかどうか。 default = false |
| data-use-worker  | boolean: pyodideがworkerスレッドで実行されるかどうか。 default = false |
| data-pyodide  | DOMString: pyodideがメインスレッドで実行される場合、[pyodideオブジェクト](https://pyodide.org/en/stable/usage/api/js-api.html#globalThis.pyodide)で解決するグローバルなプロミスの名前。optional。省略した場合、pythonスクリプトの実行時に`pyodide`という名前のグローバルなpyodideオブジェクトがある必要があります。また、`data-execute`属性は無視されます。pyodideがworkerスレッドで実行される場合、pythonスクリプトを引数に取り実行結果のプロミスを返すグローバルな関数の名前。required。pythonの実行が成功した場合、結果は`{log, results}`で解決され、失敗した場合はエラーメッセージを理由にリジェクトされる必要があります。 |
| data-execute  | boolean: ページ読み込み時に自動でpythonスクリプトを実行する。 default = false |
| data-line  | boolean: 行番号を表示する。 default = true |

### example
- [workerを使わない例](example/py-cell/cells.html)
- [workerを使う例](example/py-cell/cells_useworker.html)

