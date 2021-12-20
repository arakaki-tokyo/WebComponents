const hljs = require('highlight.js/lib/core');
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
globalThis.hljs = hljs;

const marked = require("marked");
globalThis.marked = marked;