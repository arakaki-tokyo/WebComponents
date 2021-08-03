const dir = import.meta.url.match(/^.*\//g)[0];
const pyodideWorker = new Worker(`${dir}py_worker.js`);
let jobs = Promise.resolve();
export function load(packages = []) {
    pyodideWorker.postMessage({ function: "load", args: { packages } })
}

export async function exec(code) {
    jobs = jobs.catch(() => undefined).then(() => new Promise((resolve, reject) => {
        pyodideWorker.onmessage = e => {
            if (e.data.error) {
                reject(e.data.error);
                jobs = Promise.resolve()
            } else {
                resolve(e.data);
            }
        }
        pyodideWorker.postMessage({ function: "exec", args: { code } })
    }))
    return jobs
}