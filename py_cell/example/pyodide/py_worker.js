const katex = import('https://cdn.jsdelivr.net/npm/katex@0.15.1/dist/katex.mjs');
const dirName = location.href.match(/^.*\//g)[0];
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

        # Set Japanese Font
        import matplotlib as mpl
        import pyodide

        URL = '${dirName}ipaexg.ttf'
        path = os.path.join(mpl.get_data_path(), "fonts/ttf/ipaexg.ttf")
        with open(path, "wb") as f:
            f.write(await(await pyodide.http.pyfetch(URL)).bytes())
        
        import matplotlib.font_manager as fm
        
        font_name = 'IPAexGothic'
        # fm.fontManager.ttflist.insert(0, fm.FontEntry(fname=path, name=font_name))
        fm.fontManager.addfont(path)
        mpl.rcParams['font.family'] = font_name
        `,
    "webbrowser": `
        import webbrowser
        webbrowser.get = lambda:None
        `,
    "PIL": `
        import js
        import io
        import base64
        import PIL.ImageShow
        class PyCellViewer(PIL.ImageShow.Viewer):
            def show(self, image, **options):
                if image.format is not None:
                    ext = image.format
                elif "IMAGE_SHOW_FORMAT" in globals() and IMAGE_SHOW_FORMAT != "":
                    ext = IMAGE_SHOW_FORMAT
                else:
                    ext = "PNG"
                buf = io.BytesIO()
                image.save(buf, format=ext)
                js.DISPLAY = f'<img src="data:image/{ext.lower()};base64,{base64.b64encode(buf.getvalue()).decode()}">'
                return 1

        PIL.ImageShow.register(PyCellViewer(), 0)
        `,
}

class OutBuffer {
    constructor() {
        this.log = ""
    }
    write(s) {
        this.log += s;
    }
}
globalThis.DISPLAY = "";

function load({ packages, init } = {}) {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js');
    self.Pyodide = (async () => {
        self.pyodide = await loadPyodide();
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
        if (globalThis.DISPLAY) {
            results = globalThis.DISPLAY;
            globalThis.DISPLAY = "";
        } else if (pyodide.isPyProxy(results)) {
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