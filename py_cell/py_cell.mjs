(() => { var e = { 390: e => { var n = { exports: {} }; function t(e) { return e instanceof Map ? e.clear = e.delete = e.set = function () { throw new Error("map is read-only") } : e instanceof Set && (e.add = e.clear = e.delete = function () { throw new Error("set is read-only") }), Object.freeze(e), Object.getOwnPropertyNames(e).forEach((function (n) { var i = e[n]; "object" != typeof i || Object.isFrozen(i) || t(i) })), e } n.exports = t, n.exports.default = t; var i = n.exports; class r { constructor(e) { void 0 === e.data && (e.data = {}), this.data = e.data, this.isMatchIgnored = !1 } ignoreMatch() { this.isMatchIgnored = !0 } } function s(e) { return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;") } function o(e, ...n) { const t = Object.create(null); for (const n in e) t[n] = e[n]; return n.forEach((function (e) { for (const n in e) t[n] = e[n] })), t } const a = e => !!e.kind; class c { constructor(e, n) { this.buffer = "", this.classPrefix = n.classPrefix, e.walk(this) } addText(e) { this.buffer += s(e) } openNode(e) { if (!a(e)) return; let n = e.kind; n = e.sublanguage ? `language-${n}` : ((e, { prefix: n }) => { if (e.includes(".")) { const t = e.split("."); return [`${n}${t.shift()}`, ...t.map(((e, n) => `${e}${"_".repeat(n + 1)}`))].join(" ") } return `${n}${e}` })(n, { prefix: this.classPrefix }), this.span(n) } closeNode(e) { a(e) && (this.buffer += "</span>") } value() { return this.buffer } span(e) { this.buffer += `<span class="${e}">` } } class l { constructor() { this.rootNode = { children: [] }, this.stack = [this.rootNode] } get top() { return this.stack[this.stack.length - 1] } get root() { return this.rootNode } add(e) { this.top.children.push(e) } openNode(e) { const n = { kind: e, children: [] }; this.add(n), this.stack.push(n) } closeNode() { if (this.stack.length > 1) return this.stack.pop() } closeAllNodes() { for (; this.closeNode();); } toJSON() { return JSON.stringify(this.rootNode, null, 4) } walk(e) { return this.constructor._walk(e, this.rootNode) } static _walk(e, n) { return "string" == typeof n ? e.addText(n) : n.children && (e.openNode(n), n.children.forEach((n => this._walk(e, n))), e.closeNode(n)), e } static _collapse(e) { "string" != typeof e && e.children && (e.children.every((e => "string" == typeof e)) ? e.children = [e.children.join("")] : e.children.forEach((e => { l._collapse(e) }))) } } class u extends l { constructor(e) { super(), this.options = e } addKeyword(e, n) { "" !== e && (this.openNode(n), this.addText(e), this.closeNode()) } addText(e) { "" !== e && this.add(e) } addSublanguage(e, n) { const t = e.root; t.kind = n, t.sublanguage = !0, this.add(t) } toHTML() { return new c(this, this.options).value() } finalize() { return !0 } } function g(e) { return e ? "string" == typeof e ? e : e.source : null } function d(...e) { return e.map((e => g(e))).join("") } function h(...e) { return "(" + (function (e) { const n = e[e.length - 1]; return "object" == typeof n && n.constructor === Object ? (e.splice(e.length - 1, 1), n) : {} }(e).capture ? "" : "?:") + e.map((e => g(e))).join("|") + ")" } function f(e) { return new RegExp(e.toString() + "|").exec("").length - 1 } const p = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./; function b(e, { joinWith: n }) { let t = 0; return e.map((e => { t += 1; const n = t; let i = g(e), r = ""; for (; i.length > 0;) { const e = p.exec(i); if (!e) { r += i; break } r += i.substring(0, e.index), i = i.substring(e.index + e[0].length), "\\" === e[0][0] && e[1] ? r += "\\" + String(Number(e[1]) + n) : (r += e[0], "(" === e[0] && t++) } return r })).map((e => `(${e})`)).join(n) } const m = "[a-zA-Z]\\w*", E = "[a-zA-Z_]\\w*", y = "\\b\\d+(\\.\\d+)?", w = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", _ = "\\b(0b[01]+)", x = { begin: "\\\\[\\s\\S]", relevance: 0 }, v = { scope: "string", begin: "'", end: "'", illegal: "\\n", contains: [x] }, S = { scope: "string", begin: '"', end: '"', illegal: "\\n", contains: [x] }, A = function (e, n, t = {}) { const i = o({ scope: "comment", begin: e, end: n, contains: [] }, t); i.contains.push({ scope: "doctag", begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)", end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/, excludeBegin: !0, relevance: 0 }); const r = h("I", "a", "is", "so", "us", "to", "at", "if", "in", "it", "on", /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, /[A-Za-z]+[-][a-z]+/, /[A-Za-z][a-z]{2,}/); return i.contains.push({ begin: d(/[ ]+/, "(", r, /[.]?[:]?([.][ ]|[ ])/, "){3}") }), i }, O = A("//", "$"), N = A("/\\*", "\\*/"), R = A("#", "$"), k = { scope: "number", begin: y, relevance: 0 }, M = { scope: "number", begin: w, relevance: 0 }, B = { scope: "number", begin: _, relevance: 0 }, j = { begin: /(?=\/[^/\n]*\/)/, contains: [{ scope: "regexp", begin: /\//, end: /\/[gimuy]*/, illegal: /\n/, contains: [x, { begin: /\[/, end: /\]/, relevance: 0, contains: [x] }] }] }, I = { scope: "title", begin: m, relevance: 0 }, T = { scope: "title", begin: E, relevance: 0 }; var L = Object.freeze({ __proto__: null, MATCH_NOTHING_RE: /\b\B/, IDENT_RE: m, UNDERSCORE_IDENT_RE: E, NUMBER_RE: y, C_NUMBER_RE: w, BINARY_NUMBER_RE: _, RE_STARTERS_RE: "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", SHEBANG: (e = {}) => { const n = /^#![ ]*\//; return e.binary && (e.begin = d(n, /.*\b/, e.binary, /\b.*/)), o({ scope: "meta", begin: n, end: /$/, relevance: 0, "on:begin": (e, n) => { 0 !== e.index && n.ignoreMatch() } }, e) }, BACKSLASH_ESCAPE: x, APOS_STRING_MODE: v, QUOTE_STRING_MODE: S, PHRASAL_WORDS_MODE: { begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/ }, COMMENT: A, C_LINE_COMMENT_MODE: O, C_BLOCK_COMMENT_MODE: N, HASH_COMMENT_MODE: R, NUMBER_MODE: k, C_NUMBER_MODE: M, BINARY_NUMBER_MODE: B, REGEXP_MODE: j, TITLE_MODE: I, UNDERSCORE_TITLE_MODE: T, METHOD_GUARD: { begin: "\\.\\s*[a-zA-Z_]\\w*", relevance: 0 }, END_SAME_AS_BEGIN: function (e) { return Object.assign(e, { "on:begin": (e, n) => { n.data._beginMatch = e[1] }, "on:end": (e, n) => { n.data._beginMatch !== e[1] && n.ignoreMatch() } }) } }); function C(e, n) { "." === e.input[e.index - 1] && n.ignoreMatch() } function P(e, n) { void 0 !== e.className && (e.scope = e.className, delete e.className) } function $(e, n) { n && e.beginKeywords && (e.begin = "\\b(" + e.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", e.__beforeBegin = C, e.keywords = e.keywords || e.beginKeywords, delete e.beginKeywords, void 0 === e.relevance && (e.relevance = 0)) } function D(e, n) { Array.isArray(e.illegal) && (e.illegal = h(...e.illegal)) } function H(e, n) { if (e.match) { if (e.begin || e.end) throw new Error("begin & end are not supported with match"); e.begin = e.match, delete e.match } } function U(e, n) { void 0 === e.relevance && (e.relevance = 1) } const z = (e, n) => { if (!e.beforeMatch) return; if (e.starts) throw new Error("beforeMatch cannot be used with starts"); const t = Object.assign({}, e); Object.keys(e).forEach((n => { delete e[n] })), e.keywords = t.keywords, e.begin = d(t.beforeMatch, d("(?=", t.begin, ")")), e.starts = { relevance: 0, contains: [Object.assign(t, { endsParent: !0 })] }, e.relevance = 0, delete t.beforeMatch }, F = ["of", "and", "for", "in", "not", "or", "if", "then", "parent", "list", "value"]; function K(e, n, t = "keyword") { const i = Object.create(null); return "string" == typeof e ? r(t, e.split(" ")) : Array.isArray(e) ? r(t, e) : Object.keys(e).forEach((function (t) { Object.assign(i, K(e[t], n, t)) })), i; function r(e, t) { n && (t = t.map((e => e.toLowerCase()))), t.forEach((function (n) { const t = n.split("|"); i[t[0]] = [e, X(t[0], t[1])] })) } } function X(e, n) { return n ? Number(n) : function (e) { return F.includes(e.toLowerCase()) }(e) ? 0 : 1 } const Z = {}, G = e => { console.error(e) }, W = (e, ...n) => { console.log(`WARN: ${e}`, ...n) }, J = (e, n) => { Z[`${e}/${n}`] || (console.log(`Deprecated as of ${e}. ${n}`), Z[`${e}/${n}`] = !0) }, V = new Error; function q(e, n, { key: t }) { let i = 0; const r = e[t], s = {}, o = {}; for (let e = 1; e <= n.length; e++)o[e + i] = r[e], s[e + i] = !0, i += f(n[e - 1]); e[t] = o, e[t]._emit = s, e[t]._multi = !0 } function Q(e) { !function (e) { e.scope && "object" == typeof e.scope && null !== e.scope && (e.beginScope = e.scope, delete e.scope) }(e), "string" == typeof e.beginScope && (e.beginScope = { _wrap: e.beginScope }), "string" == typeof e.endScope && (e.endScope = { _wrap: e.endScope }), function (e) { if (Array.isArray(e.begin)) { if (e.skip || e.excludeBegin || e.returnBegin) throw G("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), V; if ("object" != typeof e.beginScope || null === e.beginScope) throw G("beginScope must be object"), V; q(e, e.begin, { key: "beginScope" }), e.begin = b(e.begin, { joinWith: "" }) } }(e), function (e) { if (Array.isArray(e.end)) { if (e.skip || e.excludeEnd || e.returnEnd) throw G("skip, excludeEnd, returnEnd not compatible with endScope: {}"), V; if ("object" != typeof e.endScope || null === e.endScope) throw G("endScope must be object"), V; q(e, e.end, { key: "endScope" }), e.end = b(e.end, { joinWith: "" }) } }(e) } function Y(e) { function n(n, t) { return new RegExp(g(n), "m" + (e.case_insensitive ? "i" : "") + (t ? "g" : "")) } class t { constructor() { this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0 } addRule(e, n) { n.position = this.position++, this.matchIndexes[this.matchAt] = n, this.regexes.push([n, e]), this.matchAt += f(e) + 1 } compile() { 0 === this.regexes.length && (this.exec = () => null); const e = this.regexes.map((e => e[1])); this.matcherRe = n(b(e, { joinWith: "|" }), !0), this.lastIndex = 0 } exec(e) { this.matcherRe.lastIndex = this.lastIndex; const n = this.matcherRe.exec(e); if (!n) return null; const t = n.findIndex(((e, n) => n > 0 && void 0 !== e)), i = this.matchIndexes[t]; return n.splice(0, t), Object.assign(n, i) } } class i { constructor() { this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0 } getMatcher(e) { if (this.multiRegexes[e]) return this.multiRegexes[e]; const n = new t; return this.rules.slice(e).forEach((([e, t]) => n.addRule(e, t))), n.compile(), this.multiRegexes[e] = n, n } resumingScanAtSamePosition() { return 0 !== this.regexIndex } considerAll() { this.regexIndex = 0 } addRule(e, n) { this.rules.push([e, n]), "begin" === n.type && this.count++ } exec(e) { const n = this.getMatcher(this.regexIndex); n.lastIndex = this.lastIndex; let t = n.exec(e); if (this.resumingScanAtSamePosition()) if (t && t.index === this.lastIndex); else { const n = this.getMatcher(0); n.lastIndex = this.lastIndex + 1, t = n.exec(e) } return t && (this.regexIndex += t.position + 1, this.regexIndex === this.count && this.considerAll()), t } } if (e.compilerExtensions || (e.compilerExtensions = []), e.contains && e.contains.includes("self")) throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation."); return e.classNameAliases = o(e.classNameAliases || {}), function t(r, s) { const a = r; if (r.isCompiled) return a;[P, H, Q, z].forEach((e => e(r, s))), e.compilerExtensions.forEach((e => e(r, s))), r.__beforeBegin = null, [$, D, U].forEach((e => e(r, s))), r.isCompiled = !0; let c = null; return "object" == typeof r.keywords && r.keywords.$pattern && (r.keywords = Object.assign({}, r.keywords), c = r.keywords.$pattern, delete r.keywords.$pattern), c = c || /\w+/, r.keywords && (r.keywords = K(r.keywords, e.case_insensitive)), a.keywordPatternRe = n(c, !0), s && (r.begin || (r.begin = /\B|\b/), a.beginRe = n(r.begin), r.end || r.endsWithParent || (r.end = /\B|\b/), r.end && (a.endRe = n(r.end)), a.terminatorEnd = g(r.end) || "", r.endsWithParent && s.terminatorEnd && (a.terminatorEnd += (r.end ? "|" : "") + s.terminatorEnd)), r.illegal && (a.illegalRe = n(r.illegal)), r.contains || (r.contains = []), r.contains = [].concat(...r.contains.map((function (e) { return function (e) { return e.variants && !e.cachedVariants && (e.cachedVariants = e.variants.map((function (n) { return o(e, { variants: null }, n) }))), e.cachedVariants ? e.cachedVariants : ee(e) ? o(e, { starts: e.starts ? o(e.starts) : null }) : Object.isFrozen(e) ? o(e) : e }("self" === e ? r : e) }))), r.contains.forEach((function (e) { t(e, a) })), r.starts && t(r.starts, s), a.matcher = function (e) { const n = new i; return e.contains.forEach((e => n.addRule(e.begin, { rule: e, type: "begin" }))), e.terminatorEnd && n.addRule(e.terminatorEnd, { type: "end" }), e.illegal && n.addRule(e.illegal, { type: "illegal" }), n }(a), a }(e) } function ee(e) { return !!e && (e.endsWithParent || ee(e.starts)) } const ne = s, te = o, ie = Symbol("nomatch"); var re = function (e) { const n = Object.create(null), t = Object.create(null), s = []; let o = !0; const a = "Could not find the language '{}', did you forget to load/include a language module?", c = { disableAutodetect: !0, name: "Plain text", contains: [] }; let l = { ignoreUnescapedHTML: !1, noHighlightRe: /^(no-?highlight)$/i, languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i, classPrefix: "hljs-", cssSelector: "pre code", languages: null, __emitter: u }; function g(e) { return l.noHighlightRe.test(e) } function d(e, n, t) { let i = "", r = ""; "object" == typeof n ? (i = e, t = n.ignoreIllegals, r = n.language) : (J("10.7.0", "highlight(lang, code, ...args) has been deprecated."), J("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277"), r = e, i = n), void 0 === t && (t = !0); const s = { code: i, language: r }; _("before:highlight", s); const o = s.result ? s.result : h(s.language, s.code, t); return o.code = s.code, _("after:highlight", o), o } function h(e, t, i, s) { const c = Object.create(null); function u() { if (!A.keywords) return void N.addText(R); let e = 0; A.keywordPatternRe.lastIndex = 0; let n = A.keywordPatternRe.exec(R), t = ""; for (; n;) { t += R.substring(e, n.index); const r = x.case_insensitive ? n[0].toLowerCase() : n[0], s = (i = r, A.keywords[i]); if (s) { const [e, i] = s; if (N.addText(t), t = "", c[r] = (c[r] || 0) + 1, c[r] <= 7 && (k += i), e.startsWith("_")) t += n[0]; else { const t = x.classNameAliases[e] || e; N.addKeyword(n[0], t) } } else t += n[0]; e = A.keywordPatternRe.lastIndex, n = A.keywordPatternRe.exec(R) } var i; t += R.substr(e), N.addText(t) } function g() { null != A.subLanguage ? function () { if ("" === R) return; let e = null; if ("string" == typeof A.subLanguage) { if (!n[A.subLanguage]) return void N.addText(R); e = h(A.subLanguage, R, !0, O[A.subLanguage]), O[A.subLanguage] = e._top } else e = f(R, A.subLanguage.length ? A.subLanguage : null); A.relevance > 0 && (k += e.relevance), N.addSublanguage(e._emitter, e.language) }() : u(), R = "" } function d(e, n) { let t = 1; for (; void 0 !== n[t];) { if (!e._emit[t]) { t++; continue } const i = x.classNameAliases[e[t]] || e[t], r = n[t]; i ? N.addKeyword(r, i) : (R = r, u(), R = ""), t++ } } function p(e, n) { return e.scope && "string" == typeof e.scope && N.openNode(x.classNameAliases[e.scope] || e.scope), e.beginScope && (e.beginScope._wrap ? (N.addKeyword(R, x.classNameAliases[e.beginScope._wrap] || e.beginScope._wrap), R = "") : e.beginScope._multi && (d(e.beginScope, n), R = "")), A = Object.create(e, { parent: { value: A } }), A } function b(e, n, t) { let i = function (e, n) { const t = e && e.exec(n); return t && 0 === t.index }(e.endRe, t); if (i) { if (e["on:end"]) { const t = new r(e); e["on:end"](n, t), t.isMatchIgnored && (i = !1) } if (i) { for (; e.endsParent && e.parent;)e = e.parent; return e } } if (e.endsWithParent) return b(e.parent, n, t) } function m(e) { return 0 === A.matcher.regexIndex ? (R += e[0], 1) : (j = !0, 0) } function y(e) { const n = e[0], i = t.substr(e.index), r = b(A, e, i); if (!r) return ie; const s = A; A.endScope && A.endScope._wrap ? (g(), N.addKeyword(n, A.endScope._wrap)) : A.endScope && A.endScope._multi ? (g(), d(A.endScope, e)) : s.skip ? R += n : (s.returnEnd || s.excludeEnd || (R += n), g(), s.excludeEnd && (R = n)); do { A.scope && N.closeNode(), A.skip || A.subLanguage || (k += A.relevance), A = A.parent } while (A !== r.parent); return r.starts && p(r.starts, e), s.returnEnd ? 0 : n.length } let w = {}; function _(n, s) { const a = s && s[0]; if (R += n, null == a) return g(), 0; if ("begin" === w.type && "end" === s.type && w.index === s.index && "" === a) { if (R += t.slice(s.index, s.index + 1), !o) { const n = new Error(`0 width match regex (${e})`); throw n.languageName = e, n.badRule = w.rule, n } return 1 } if (w = s, "begin" === s.type) return function (e) { const n = e[0], t = e.rule, i = new r(t), s = [t.__beforeBegin, t["on:begin"]]; for (const t of s) if (t && (t(e, i), i.isMatchIgnored)) return m(n); return t.skip ? R += n : (t.excludeBegin && (R += n), g(), t.returnBegin || t.excludeBegin || (R = n)), p(t, e), t.returnBegin ? 0 : n.length }(s); if ("illegal" === s.type && !i) { const e = new Error('Illegal lexeme "' + a + '" for mode "' + (A.scope || "<unnamed>") + '"'); throw e.mode = A, e } if ("end" === s.type) { const e = y(s); if (e !== ie) return e } if ("illegal" === s.type && "" === a) return 1; if (B > 1e5 && B > 3 * s.index) throw new Error("potential infinite loop, way more iterations than matches"); return R += a, a.length } const x = E(e); if (!x) throw G(a.replace("{}", e)), new Error('Unknown language: "' + e + '"'); const v = Y(x); let S = "", A = s || v; const O = {}, N = new l.__emitter(l); !function () { const e = []; for (let n = A; n !== x; n = n.parent)n.scope && e.unshift(n.scope); e.forEach((e => N.openNode(e))) }(); let R = "", k = 0, M = 0, B = 0, j = !1; try { for (A.matcher.considerAll(); ;) { B++, j ? j = !1 : A.matcher.considerAll(), A.matcher.lastIndex = M; const e = A.matcher.exec(t); if (!e) break; const n = _(t.substring(M, e.index), e); M = e.index + n } return _(t.substr(M)), N.closeAllNodes(), N.finalize(), S = N.toHTML(), { language: e, value: S, relevance: k, illegal: !1, _emitter: N, _top: A } } catch (n) { if (n.message && n.message.includes("Illegal")) return { language: e, value: ne(t), illegal: !0, relevance: 0, _illegalBy: { message: n.message, index: M, context: t.slice(M - 100, M + 100), mode: n.mode, resultSoFar: S }, _emitter: N }; if (o) return { language: e, value: ne(t), illegal: !1, relevance: 0, errorRaised: n, _emitter: N, _top: A }; throw n } } function f(e, t) { t = t || l.languages || Object.keys(n); const i = function (e) { const n = { value: ne(e), illegal: !1, relevance: 0, _top: c, _emitter: new l.__emitter(l) }; return n._emitter.addText(e), n }(e), r = t.filter(E).filter(w).map((n => h(n, e, !1))); r.unshift(i); const s = r.sort(((e, n) => { if (e.relevance !== n.relevance) return n.relevance - e.relevance; if (e.language && n.language) { if (E(e.language).supersetOf === n.language) return 1; if (E(n.language).supersetOf === e.language) return -1 } return 0 })), [o, a] = s, u = o; return u.secondBest = a, u } function p(e) { let n = null; const i = function (e) { let n = e.className + " "; n += e.parentNode ? e.parentNode.className : ""; const t = l.languageDetectRe.exec(n); if (t) { const n = E(t[1]); return n || (W(a.replace("{}", t[1])), W("Falling back to no-highlight mode for this block.", e)), n ? t[1] : "no-highlight" } return n.split(/\s+/).find((e => g(e) || E(e))) }(e); if (g(i)) return; _("before:highlightElement", { el: e, language: i }), !l.ignoreUnescapedHTML && e.children.length > 0 && (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/issues/2886"), console.warn(e)), n = e; const r = n.textContent, s = i ? d(r, { language: i, ignoreIllegals: !0 }) : f(r); e.innerHTML = s.value, function (e, n, i) { const r = n && t[n] || i; e.classList.add("hljs"), e.classList.add(`language-${r}`) }(e, i, s.language), e.result = { language: s.language, re: s.relevance, relevance: s.relevance }, s.secondBest && (e.secondBest = { language: s.secondBest.language, relevance: s.secondBest.relevance }), _("after:highlightElement", { el: e, result: s, text: r }) } let b = !1; function m() { "loading" !== document.readyState ? document.querySelectorAll(l.cssSelector).forEach(p) : b = !0 } function E(e) { return e = (e || "").toLowerCase(), n[e] || n[t[e]] } function y(e, { languageName: n }) { "string" == typeof e && (e = [e]), e.forEach((e => { t[e.toLowerCase()] = n })) } function w(e) { const n = E(e); return n && !n.disableAutodetect } function _(e, n) { const t = e; s.forEach((function (e) { e[t] && e[t](n) })) } "undefined" != typeof window && window.addEventListener && window.addEventListener("DOMContentLoaded", (function () { b && m() }), !1), Object.assign(e, { highlight: d, highlightAuto: f, highlightAll: m, highlightElement: p, highlightBlock: function (e) { return J("10.7.0", "highlightBlock will be removed entirely in v12.0"), J("10.7.0", "Please use highlightElement now."), p(e) }, configure: function (e) { l = te(l, e) }, initHighlighting: () => { m(), J("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.") }, initHighlightingOnLoad: function () { m(), J("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.") }, registerLanguage: function (t, i) { let r = null; try { r = i(e) } catch (e) { if (G("Language definition for '{}' could not be registered.".replace("{}", t)), !o) throw e; G(e), r = c } r.name || (r.name = t), n[t] = r, r.rawDefinition = i.bind(null, e), r.aliases && y(r.aliases, { languageName: t }) }, unregisterLanguage: function (e) { delete n[e]; for (const n of Object.keys(t)) t[n] === e && delete t[n] }, listLanguages: function () { return Object.keys(n) }, getLanguage: E, registerAliases: y, autoDetection: w, inherit: te, addPlugin: function (e) { !function (e) { e["before:highlightBlock"] && !e["before:highlightElement"] && (e["before:highlightElement"] = n => { e["before:highlightBlock"](Object.assign({ block: n.el }, n)) }), e["after:highlightBlock"] && !e["after:highlightElement"] && (e["after:highlightElement"] = n => { e["after:highlightBlock"](Object.assign({ block: n.el }, n)) }) }(e), s.push(e) } }), e.debugMode = function () { o = !1 }, e.safeMode = function () { o = !0 }, e.versionString = "11.2.0"; for (const e in L) "object" == typeof L[e] && i(L[e]); return Object.assign(e, L), e }({}); e.exports = re }, 245: e => { function n(e) { return e ? "string" == typeof e ? e : e.source : null } function t(...e) { return e.map((e => n(e))).join("") } const i = "[a-zA-Z_]\\w*", r = function (e, i, r = {}) { const s = function (e, ...n) { const t = Object.create(null); for (const n in e) t[n] = e[n]; return n.forEach((function (e) { for (const n in e) t[n] = e[n] })), t }({ scope: "comment", begin: e, end: i, contains: [] }, r); s.contains.push({ scope: "doctag", begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)", end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/, excludeBegin: !0, relevance: 0 }); const o = function (...e) { return "(" + (function (e) { const n = e[e.length - 1]; return "object" == typeof n && n.constructor === Object ? (e.splice(e.length - 1, 1), n) : {} }(e).capture ? "" : "?:") + e.map((e => n(e))).join("|") + ")" }("I", "a", "is", "so", "us", "to", "at", "if", "in", "it", "on", /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, /[A-Za-z]+[-][a-z]+/, /[A-Za-z][a-z]{2,}/); return s.contains.push({ begin: t(/[ ]+/, "(", o, /[.]?[:]?([.][ ]|[ ])/, "){3}") }), s }; r("//", "$"), r("/\\*", "\\*/"), r("#", "$"), e.exports = function (e) { const n = { $pattern: /[A-Za-z]\w+|__\w+__/, keyword: ["and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal|10", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield"], built_in: ["__import__", "abs", "all", "any", "ascii", "bin", "bool", "breakpoint", "bytearray", "bytes", "callable", "chr", "classmethod", "compile", "complex", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "exec", "filter", "float", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "hex", "id", "input", "int", "isinstance", "issubclass", "iter", "len", "list", "locals", "map", "max", "memoryview", "min", "next", "object", "oct", "open", "ord", "pow", "print", "property", "range", "repr", "reversed", "round", "set", "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "vars", "zip"], literal: ["__debug__", "Ellipsis", "False", "None", "NotImplemented", "True"], type: ["Any", "Callable", "Coroutine", "Dict", "List", "Literal", "Generic", "Optional", "Sequence", "Set", "Tuple", "Type", "Union"] }, r = { className: "meta", begin: /^(>>>|\.\.\.) / }, s = { className: "subst", begin: /\{/, end: /\}/, keywords: n, illegal: /#/ }, o = { begin: /\{\{/, relevance: 0 }, a = { className: "string", contains: [e.BACKSLASH_ESCAPE], variants: [{ begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/, end: /'''/, contains: [e.BACKSLASH_ESCAPE, r], relevance: 10 }, { begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/, end: /"""/, contains: [e.BACKSLASH_ESCAPE, r], relevance: 10 }, { begin: /([fF][rR]|[rR][fF]|[fF])'''/, end: /'''/, contains: [e.BACKSLASH_ESCAPE, r, o, s] }, { begin: /([fF][rR]|[rR][fF]|[fF])"""/, end: /"""/, contains: [e.BACKSLASH_ESCAPE, r, o, s] }, { begin: /([uU]|[rR])'/, end: /'/, relevance: 10 }, { begin: /([uU]|[rR])"/, end: /"/, relevance: 10 }, { begin: /([bB]|[bB][rR]|[rR][bB])'/, end: /'/ }, { begin: /([bB]|[bB][rR]|[rR][bB])"/, end: /"/ }, { begin: /([fF][rR]|[rR][fF]|[fF])'/, end: /'/, contains: [e.BACKSLASH_ESCAPE, o, s] }, { begin: /([fF][rR]|[rR][fF]|[fF])"/, end: /"/, contains: [e.BACKSLASH_ESCAPE, o, s] }, e.APOS_STRING_MODE, e.QUOTE_STRING_MODE] }, c = "[0-9](_?[0-9])*", l = `(\\b(${c}))?\\.(${c})|\\b(${c})\\.`, u = { className: "number", relevance: 0, variants: [{ begin: `(\\b(${c})|(${l}))[eE][+-]?(${c})[jJ]?\\b` }, { begin: `(${l})[jJ]?` }, { begin: "\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?\\b" }, { begin: "\\b0[bB](_?[01])+[lL]?\\b" }, { begin: "\\b0[oO](_?[0-7])+[lL]?\\b" }, { begin: "\\b0[xX](_?[0-9a-fA-F])+[lL]?\\b" }, { begin: `\\b(${c})[jJ]\\b` }] }, g = { className: "comment", begin: (d = /# type:/, t("(?=", d, ")")), end: /$/, keywords: n, contains: [{ begin: /# type:/ }, { begin: /#/, end: /\b\B/, endsWithParent: !0 }] }; var d; const h = { className: "params", variants: [{ className: "", begin: /\(\s*\)/, skip: !0 }, { begin: /\(/, end: /\)/, excludeBegin: !0, excludeEnd: !0, keywords: n, contains: ["self", r, u, a, e.HASH_COMMENT_MODE] }] }; return s.contains = [a, u, r], { name: "Python", aliases: ["py", "gyp", "ipython"], keywords: n, illegal: /(<\/|->|\?)|=>/, contains: [r, u, { begin: /\bself\b/ }, { beginKeywords: "if", relevance: 0 }, a, g, e.HASH_COMMENT_MODE, { match: [/def/, /\s+/, i], scope: { 1: "keyword", 3: "title.function" }, contains: [h] }, { variants: [{ match: [/class/, /\s+/, i, /\s*/, /\(\s*/, i, /\s*\)/] }, { match: [/class/, /\s+/, i] }], scope: { 1: "keyword", 3: "title.class", 6: "title.class.inherited" } }, { className: "meta", begin: /^[\t ]*@/, end: /(?=#)|$/, contains: [u, h, a] }] } } } }, n = {}; function t(i) { var r = n[i]; if (void 0 !== r) return r.exports; var s = n[i] = { exports: {} }; return e[i](s, s.exports, t), s.exports } (() => { const e = t(390); e.registerLanguage("python", t(245)), globalThis.hljs = e })() })();

(function insertStyle() {
    const style = document.createElement("style");
    style.innerHTML =
        // for pandas DaraFrame table
        `
        py-cell-out table.dataframe{
            border-collapse: collapse;
            border: none;
            font-size: 12px;
            border-color: transparent;
        }
        py-cell-out .dataframe thead{
            border-bottom: 1px solid gray;
        }
        py-cell-out .dataframe th, 
        py-cell-out .dataframe tr, 
        py-cell-out .dataframe td{
            text-align: right;
            padding: 0.5em 0.5em;
        }
        py-cell-out .dataframe tbody tr:nth-child(odd) {
            background: whitesmoke;
        }
        py-cell-out .dataframe tbody tr:hover {
            background: paleturquoise;
        }`
        // for matplotlib html5_canvas_backend v.0.18.0
        + `
        py-cell-out .fa::after{
            display: inline-block;
            height: 1rem;
            width: 1rem;
            background: #495057;
            transition-duration: 0.4s;
        }
        py-cell-out .fa:hover::after{
            background: #fff;
        }
        
        py-cell-out .fa-home::after {
            content: "";
            clip-path: url(#fa-home);
        }
        py-cell-out .fa-arrow-left::after {
            content: "";
            clip-path: url(#fa-arrow-left);
        }
        py-cell-out .fa-search-plus::after {
            content: "";
            clip-path: url(#fa-search-plus);
        }
        py-cell-out .fa-arrows::after {
            content: "";
            clip-path: url(#fa-arrows);
        }
        py-cell-out .fa-arrow-right::after {
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

class PyCellIn extends HTMLElement {
    lines;
    async connectedCallback() {
        const thisCSS = {
            display: "block",
            position: "relative",
        }
        Object.entries(thisCSS).forEach(([prop, value]) => this.style[prop] = value);

        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = `
            <style>
                :host([no-line]) [data-role="lineNumber"] {
                    display: none !important;
                }

                [data-role="lineNumber"] {
                    counter-reset: line;
                    position: absolute;
                    top: 0;
                    left: 0;
                    text-align: right;
                    box-sizing: border-box;
                    padding: 1em .7em;
                    width: 3em;
                    opacity: .5;
                    display: flex;
                    flex-direction: column;
                }
                [data-role="lineNumber"] *{
                    display: flex;
                    font-size: .9em;
                    font-family: "consolas";
                    height: 1.5rem;
                    align-items: center;
                    justify-content: flex-end;
                }
                [data-role="lineNumber"] *::after{
                    counter-increment: line;
                    content: counter(line);
                }
            </style>
            <slot></slot>
            <textarea data-role="input" spellcheck="false" wrap="off">${this.rmIndent(this.innerHTML)}</textarea>
            <div data-role="lineNumber"></div>

        `;
        shadow.querySelectorAll("[data-role]").forEach(elm => {
            this[elm.dataset.role] = elm;
        });

        this.innerHTML = `
            <pre style="box-sizing:border-box;"><code class="lang-py" data-role="code"></code></pre>
        `
        this.querySelectorAll("[data-role]").forEach(elm => {
            this[elm.dataset.role] = elm;
        });

        hljs.highlightElement(this.code);

        const commonCSS = {
            fontFamily: "Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace",
            fontSize: "1em",
            lineHeight: 1.5,
            padding: "1em",
            paddingLeft: "3.5em"/* for line-number */
        }
        if (this.hasAttribute('no-line')) {
            commonCSS.paddingLeft = "1em";
        }
        this.applyStyles(this.code, commonCSS);
        this.applyStyles(this.input, commonCSS);

        const invCol = this.getInvCol(getComputedStyle(this.code).backgroundColor);

        this.applyStyles(this.input, {
            display: "block",
            resize: "none",
            position: "absolute",
            top: 0,
            left: 0,
            boxSizing: "border-box",
            width: "100%",
            background: "transparent",
            color: "transparent",
            caretColor: invCol,
            border: "none",
            overflowY: "hidden",
        });

        this.applyStyles(this.code, {
            paddingRight: 0,
            boxSizing: "border-box"
        })

        this.applyStyles(this.lineNumber, {
            color: invCol,
            borderRight: `solid 1px ${invCol}`,
        })

        this.input.addEventListener("keydown", this.inputOnKeydown.bind(this));
        this.input.addEventListener("input", this.inputOninput.bind(this));
        this.input.addEventListener("scroll", this.inputOnscroll.bind(this));

        this.input.dispatchEvent(new Event("input"));

    }
    set value(val) { this.input.value = val }
    get value() { return this.input.value }

    applyStyles(elm, css) {
        Object.entries(css).forEach(([prop, value]) => elm.style[prop] = value);
    }

    rmIndent(org) {
        const str = org.replaceAll('\t', '    ').replace(/\s+$/, '\n');
        const ms = [...str.matchAll(/^(?<space> *).+/mg)];
        let indent = Infinity;
        for (let m of ms) {
            if (m.groups.space.length < indent) indent = m.groups.space.length;
        }

        const re = new RegExp(`^ {${indent}}`, 'mg');
        return str.replaceAll(re, '');
    }

    inputOnKeydown(e) {
        // 改行時にインデントを引き継ぐ
        if (e.key === "Enter") {
            if (e.shiftKey) {
                e.preventDefault();
                this.dispatchEvent(new Event("execute"));
            } else {
                const target = e.target
                // キー入力の挙動と衝突しないように0-timeout
                setTimeout(() => {
                    const position = target.selectionStart;
                    const precedings = target.value.slice(0, position - 1);
                    const lastLineHead = precedings.lastIndexOf('\n') + 1;

                    let thisLineHead = '\n';
                    let cnt = 0;
                    while (precedings[lastLineHead + cnt] == ' ') cnt++, thisLineHead += " ";

                    target.value = precedings + thisLineHead + target.value.substring(position);

                    target.selectionStart = position + cnt;
                    target.selectionEnd = position + cnt;
                }, 0)
            }
        }
        else if (e.key === "Tab") {
            const TAB = "    ";
            e.preventDefault();
            if (e.shiftKey) {

                const val = e.target.value;
                const begin = e.target.selectionStart;
                const end = e.target.selectionEnd;
                // 行頭のposition
                const lineHead = val.slice(0, begin).lastIndexOf("\n") + 1;

                // 文頭からカーソル(または選択範囲の始まり)行直前の改行までを保持
                const precedings = val.slice(0, lineHead);
                // カーソル(または選択範囲の終わり)から文末までを保持
                const followings = val.slice(end);
                // 行頭からカーソルまで or  選択開始の行頭 ~ 選択開始 + 選択範囲
                const target = val.slice(lineHead, end);

                let pat = '';
                for (let i = TAB.length; i > 0; i--) pat += `^ {${i}}|`;
                const FirstIndentLength = target.match(new RegExp(pat + '| {0}'))[0].length;

                const re = new RegExp(pat.slice(0, -1), 'mg');

                e.target.value = precedings + target.replaceAll(re, '') + followings;

                e.target.selectionStart = (begin - lineHead >= FirstIndentLength) ? begin - FirstIndentLength : lineHead;
                e.target.selectionEnd = e.target.value.length - followings.length;


            } else {
                const begin = e.target.selectionStart;
                const end = e.target.selectionEnd
                const val = e.target.value;

                if (begin === end) {
                    e.target.value = val.slice(0, begin) + TAB + val.substring(begin);
                    e.target.selectionEnd = begin + TAB.length;
                } else {
                    // 行頭のposition
                    const lineHead = val.slice(0, begin).lastIndexOf("\n") + 1;

                    // 文頭からカーソル(または選択範囲の始まり)行直前の改行までを保持
                    const precedings = val.slice(0, lineHead);
                    // カーソル(または選択範囲の終わり)から文末までを保持
                    const followings = val.slice(end);
                    // 行頭からカーソルまで or  選択開始の行頭 ~ 選択開始 + 選択範囲
                    const target = val.slice(lineHead, end);

                    e.target.value = precedings + target.replaceAll(/^/mg, TAB) + followings;

                    e.target.selectionStart = begin + TAB.length;
                    e.target.selectionEnd = e.target.value.length - followings.length;
                }
            }
            e.target.dispatchEvent(new Event('input'));
        }

    }

    /**
     * pythonスクリプト入力欄の制御。以下の処理を実行する。
     *  - シンタックスハイライトを更新する
     *  - 入力欄とシンタックスハイライト表示領域の高さを更新する
     * 
     * @param {*} e
     * @memberof PyCell
     */
    inputOninput(e) {
        const target = e.target
        // キー入力の挙動と衝突しないように0-timeout
        setTimeout(async () => {

            this.code.innerHTML = target.value.replaceAll("<", "&lt;");
            hljs.highlightElement(this.code);

            // 高さ計算
            this.calcHeight();
        }, 0)
    }

    calcHeight() {
        const lineCnt = (this.input.value + "\n").match(/\n/g).length;
        this.updateLineNumber(lineCnt);
        const CSS = getComputedStyle(this.input);
        const height =
            parseInt(CSS.lineHeight, 10) * lineCnt
            + parseInt(CSS.paddingTop, 10)
            + parseInt(CSS.paddingBottom, 10)
            + 17; // 横スクロールバーがあると最終行が狭まる。回避困難なので予め余裕をもっとく

        this.input.style.height = this.code.style.height = `${height}px`;
    }

    updateLineNumber(n) {
        if (this.lines !== n) {
            this.lineNumber.innerHTML = '<span></span>'.repeat(n);
            this.lines = n;
        }
    }

    inputOnscroll(e) {
        this.code.scrollLeft = this.input.scrollLeft;
        this.code.scrollTop = this.input.scrollTop;
    }

    getInvCol(rgbStr) {
        const match = [...rgbStr.matchAll(/\d+/g)];
        const r = parseInt(match[0][0], 10);
        const g = parseInt(match[1][0], 10);
        const b = parseInt(match[2][0], 10);

        const base = 255;
        return `rgb(${base - r}, ${base - g}, ${base - b})`
    }

}
customElements.define("py-cell-in", PyCellIn);

class PyCellOut extends HTMLElement {
    #isVisible = true;
    connectedCallback() {

        const shadow = this.attachShadow({ mode: "closed" });
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
    static executeCnt = 0;
    static #queue = Promise.resolve();
    connectedCallback() {
        this.style.display = "block";
        this.innerHTML = `
            <py-cell-in data-role="input" ${this.dataset.line === "false" ? 'no-line' : ''}>${this.innerHTML}</py-cell-in>
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

        // add EventListener
        this.btnRun.addEventListener("click", this.btnOnclick.bind(this))
        this.input.addEventListener("execute", () => this.btnRun.dispatchEvent(new Event("click")))

        // initialize
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
    write(s) {
        this.out.innerText += s;
    }

    async btnOnclick(e) {
        e.target.disabled = true;
        e.target.style.color = "transparent";
        this.loading.style.display = "block";

        this.constructor.#queue = this.constructor.#queue.catch(() => true).then(async () => {
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
        })

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