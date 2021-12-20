const dir = import.meta.url.match(/^.*\//g)[0];
const pyodideWorker = new Worker(`${dir}py_worker.js`);
let jobs = Promise.resolve();
export function load(packages = [], init = []) {
    pyodideWorker.postMessage({ function: "load", args: { packages, init } })
}

export async function exec(code) {
    return doExec("exec", code)
}

export async function exec2(code) {
    return doExec("exec2", code)
}

function doExec(fname, code) {
    jobs = jobs.catch(() => undefined).then(() => new Promise((resolve, reject) => {
        pyodideWorker.onmessage = e => {
            if (e.data.error) {
                reject(e.data.error);
            } else {
                resolve(e.data);
            }
        }
        pyodideWorker.postMessage({ function: fname, args: { code } })
    }))
    return jobs
}