import random
import inspect
from functools import reduce
import operator as op

handlers = dict()

def hello():
    print("hello")
    return "hello"


def interact(*args, **kwargs):
    handler = args[0]
    if handler.__name__ == '<lambda>':
        name = f'f{str(random.random())[2:]}'
        handler.__name__ = name
    handlers[handler.__name__] = handler
    
    if not callable(handler):
        raise TypeError(f"{handler} is not callable")
    params = list(inspect.signature(handler).parameters.keys())

    widgets = {}
    for param in params:
        if param not in kwargs.keys():
            raise ValueError(f"cannot find widget or abbreviation for argument: '{param}'")
        widgets[param] = gen_widget(param, kwargs[param])

    w_html = ""
    for w in widgets.values():
        w_html += w._repr_html_()

    HTML = f'''
    <div>{w_html}</div>
    <div class="w-disp"></div>
    <script>
        (async function(){{
            function write(str){{this.innerText += str}}
            const here = document.currentScript;
            const out = here.closest("[data-role='out']");
            const disp = out.querySelector(".w-disp");
            disp.write = write.bind(disp);
            const pycell = out.parentElement;

            // get widget-elements
            {reduce(op.add, [f'const {p} = out.querySelector("#{w.id}");' for p, w in widgets.items()])}
            const f = async (e, {reduce(op.add, [ f'{p},' for p in params])}) => {{
                disp.style.height = window.getComputedStyle(disp).height;
                try{{
                    await pycell.execCode(
                        `widgets.handlers["{handler.__name__}"]({reduce(op.add, [ f'{p}=${{{p}}},' for p in params])})`,
                        disp,
                        disp
                    );
                }}catch(e){{
                    // do nothing
                }}
                disp.style.height = "auto";
            }}
            widgets.onInput([{reduce(op.add, [ f'{p},' for p in params])}], f);
            setTimeout(()=>{{
                {params[0]}.dispatchEvent(new Event("input"));
            }}, 0)
        }})();
        //# sourceURL=embedded.js
    </script>
    '''
    return HTML


def gen_widget(name, value):
    if isinstance(value, Widget):
        if not value.description:
            value.description = name
        return value
    elif isinstance(value, bool):
        pass
    elif isinstance(value, int):
        # Slider
        return Slider(value, description=name)
    elif isinstance(value, tuple):
        # Slider
        if len(value) == 2:
            w = Slider(min=value[0], max=value[1], description=name)
        elif len(value) == 3:
            w = Slider(min=value[0], max=value[1], step=value[2], description=name)
        elif len(value) == 4:
            w = Slider(min=value[0], max=value[1], step=value[2], value=value[3], description=name)
        else:
            raise ValueError(f"{value} cannot be transformed to a widget")
        return w
    elif isinstance(value, list):
        pass
    elif isinstance(value, dict):
        pass
    elif isinstance(value, str):
        pass

class Widget():
    pass

class Slider(Widget):
    def __init__(self, value=None, min=None, max=None, step=None, description=None):
        self.value = value
        if self.value is None:
            self.min = min if min is not None else 0
            self.max = max if max is not None else 10
            self.value = self.min
        elif self.value < 0:
            self.min = min if min is not None else value*3
            self.max = max if max is not None else value*-1
        elif self.value > 0:
            self.min = min if min is not None else value*-1
            self.max = max if max is not None else value*3
        else:
            self.min = min if min is not None else 0
            self.max = max if max is not None else 1
            
        self.step = step if step is not None else 1
        self.description = description if description is not None else ""

        self.id = "slider" + str(random.random())[2:]

    
    def _repr_html_(self):
        return f'''
            <div style="display:flex; align-items: center;">
                <div>{self.description}</div>
                <w-slider id="{self.id}"
                    value={self.value}
                    min={self.min}
                    max={self.max}
                    step={self.step}
                ></w-slider>
            </div>
        '''