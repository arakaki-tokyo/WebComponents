async function initPyodide({ isWorker, packages = [], sw, init = [] }) {
    if (sw && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.dir(registration))
            .catch(error => console.log('Service worker registration failed, error:', error));
    }

    const ENV = {}

    const cells = document.querySelectorAll("py-cell");
    if (isWorker) {
        const pyodide = await import("./pyodide/py_worker.mjs");
        ENV.useWorker = true;
        ENV.pyodide = "pyodide.exec";

        pyodide.load(packages, init);
        globalThis.pyodide = pyodide;
    } else {
        ENV.useWorker = false;
        ENV.pyodide = "Pyodide";

        const pyodideSrc = document.createElement("script");
        pyodideSrc.id = "pyodideJs";
        pyodideSrc.src = "https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js";
        document.head.appendChild(pyodideSrc);

        window.Pyodide = new Promise((resolve, reject) => {
            document.getElementById("pyodideJs").onload = async (e) => {
                const pyodide = await loadPyodide();
                await pyodide.loadPackage(packages);
                resolve(pyodide);
            };
        });
    }

    globalThis.PYCELLENV = ENV;

    const { PyCell, FileToPy } = await import("../py_cell.mjs");
    customElements.define("py-cell", PyCell);
    customElements.define("file-to-py", FileToPy);
}