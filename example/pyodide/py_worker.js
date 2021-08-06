class OutBuffer {
    constructor() {
        this.log = ""
    }
    write(s) {
        this.log += s;
    }
}

function load({ packages } = {}) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.18.0/full/pyodide.js');
    self.Pyodide = (async () => {
        self.pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/' });
        await self.pyodide.loadPackage(packages);
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

        let results = await pyodide.runPythonAsync(code);
        if (pyodide.isPyProxy(results) && "_repr_html_" in results) {
            results = results._repr_html_();
        }
        self.postMessage({
            results: results ? String(results) : "",
            log: out.log
        });
    }
    catch (error) {
        console.dir(error)
        self.postMessage(
            { error }
        );
    }
}


self.onmessage = async (e) => {
    console.log(e)
    self[e.data.function](e.data.args)
}