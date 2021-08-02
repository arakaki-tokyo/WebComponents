class OutBuffer {
    constructor() {
        this.log = ""
    }
    write(s) {
        this.log += s;
    }
}

function load({ packages = ['pandas', 'plotly'] } = {}) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.17.0/full/pyodide.js');
    self.Pyodide = (async () => {
        await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.17.0/full/' });
        self.pyodide.loadPackage(packages);
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

        self.postMessage({
            results: await pyodide.runPythonAsync(code),
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