const katex = import('https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs');

const initScripts = {
    "urllib": `
        import email.message as em
        class Response:
            def __init__(self, content):
                self.content = content
                self.headers = em.EmailMessage()
                self.status = 200

            def getheader(self, name):
                return self.headers.get(name)
            
            def getheaders(self):
                return self.items()

            def read(self):
                return self.content.read()

            def close(*args, **kwargs):
                return True

        import pyodide
        import io
        def urlopen(url):
            sio = pyodide.open_url(url)
            return Response(io.BytesIO(sio.read().encode('utf8')))

        import urllib.request
        urllib.request.urlopen = urlopen
        `,
    "matplotlib": `
        import os
    
        os.environ['MPLBACKEND'] = 'AGG'
    
        import matplotlib.pyplot
        import base64
        from io import BytesIO
        
        def ensure_matplotlib_patch():
        
            def show():
                buf = BytesIO()
                matplotlib.pyplot.savefig(buf, format='png')
                buf.seek(0)
                # encode to a base64 str
                img = base64.b64encode(buf.read()).decode('utf-8')
                matplotlib.pyplot.clf()
        
                return f'<img src="data:image/png;base64,{img}">'
        
            matplotlib.pyplot.show = show
        
        ensure_matplotlib_patch()    
        `,
    "webbrowser": `
        import webbrowser
        webbrowser.get = lambda:None
        `
}

class OutBuffer {
    constructor() {
        this.log = ""
    }
    write(s) {
        this.log += s;
    }
}

function load({ packages, init } = {}) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.19.0/full/pyodide.js');
    self.Pyodide = (async () => {
        self.pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.19.0/full/' });
        await self.pyodide.loadPackage(packages);
        if (init) {
            for (let i of init) {
                if (i in initScripts) {
                    await self.pyodide.runPythonAsync(initScripts[i])
                }
            }
        }
        return self.pyodide;
    })();
}

async function exec({ code }) {
    const pyodide = "Pyodide" in self ? await Pyodide : null;
    if (!pyodide) {
        self.postMessage({
            error: "pyodide has not been loaded"
        });
        return;
    }

    try {
        await pyodide.runPythonAsync('if not "sys" in dir(): import sys');
        const sys = pyodide.globals.get('sys');
        const out = new OutBuffer()
        sys.stdout = out;

        await pyodide.loadPackagesFromImports(code);
        let results = await pyodide.runPythonAsync(code);
        if (pyodide.isPyProxy(results)) {
            if ("_repr_html_" in results) {
                results = results._repr_html_()
            } else if ("_repr_latex_" in results) {
                results = results._repr_latex_();
                if (typeof (results) === "string") {
                    const k = (await katex).default;
                    results = k.renderToString(results.replace(/^\$+|\$+$/g, ""))
                }
            } else if ("__repr__" in results) {
                results = results.__repr__();
                if (typeof (results) === "string")
                    results = results.replaceAll('<', '&lt;');
            }
        }
        self.postMessage({
            results: results !== undefined ? String(results) : "",
            log: out.log
        });
    }
    catch (error) {
        self.postMessage(
            { error: String(error) }
        );
    }
}

async function exec2({ code }) {
    const pyodide = "Pyodide" in self ? await Pyodide : null;
    if (!pyodide) {
        self.postMessage({
            error: "pyodide has not been loaded"
        });
        return;
    }

    try {
        await pyodide.loadPackagesFromImports(code);
        results = await pyodide.runPythonAsync(code)
        self.postMessage(String(results));
    }
    catch (error) {
        self.postMessage(
            { error: String(error) }
        );
    }
}


self.onmessage = async (e) => {
    console.log(e)
    self[e.data.function](e.data.args)
}