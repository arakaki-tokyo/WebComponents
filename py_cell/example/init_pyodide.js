async function initPyodide({ isWorker, packages = [], sw, init = [] }) {
    if (sw && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.dir(registration))
            .catch(error => console.log('Service worker registration failed, error:', error));
    }

    const cells = document.querySelectorAll("py-cell");
    if (isWorker) {
        const pyodide = await import("./pyodide/py_worker.mjs");
        cells.forEach((cell) => {
            cell.setAttribute("data-use-worker", "ture");
            cell.setAttribute("data-pyodide", "pyodide.exec");
        });

        pyodide.load(packages, init);
        globalThis.pyodide = pyodide;
    } else {
        cells.forEach((cell) => {
            cell.setAttribute("data-use-worker", "false");
            cell.setAttribute("data-pyodide", "Pyodide");
        });

        const pyodideSrc = document.createElement("script");
        pyodideSrc.id = "pyodideJs";
        pyodideSrc.src = "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js";
        document.head.appendChild(pyodideSrc);

        window.Pyodide = new Promise((resolve, reject) => {
            document.getElementById("pyodideJs").onload = async (e) => {
                const pyodide = await loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/",
                });
                await pyodide.loadPackage(packages);
                resolve(pyodide);
            };
        });
    }

    const { PyCell } = await import("../py_cell.mjs");
    customElements.define("py-cell", PyCell);
}