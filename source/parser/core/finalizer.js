import op from '../lib/object-path'
import re from "../lib/re";
import compile from './compile'
import delouser from './delouser'


export default function (config)
{
    let delouse = delouser(config);
    let { convert, interpolate, vars } = config;
    let cache = {};

    let finalize = (model, parent, index) => 
    {
        let compiled = compile(model);

        if (compiled)
        {
            let { chunks, ...rest } = compiled;            

            rest = delouse(rest);

            rest.parent = parent;
            rest.first = parent ? index === 0 : void 0;
            rest.last = parent ? index === parent.child.count - 1 : void 0;

            // we need to finalize chunks if provided
            if (((rest.value ?? null) === null) && (chunks || chunks === '')) 
            {
                let array = [], list = [].concat(chunks);

                rest.child =
                {
                    count: list.length,
                    first: list.length ? list[0].name || 'text' : void 0,
                    last: list.length ? list[list.length - 1].name || 'text' : void 0 
                };

                list.forEach((chunk, index) => 
                {
                    let render = chunk.agent ? finalize(chunk, { ...rest }, index) : 
                        delouse({ name: rest.name, value: chunk }).value;
                        
                    if (render) array.push(render);
                });

                rest.value = array.join('');
            }
            
            return (cache[rest.name] ??= toFunc(convert[rest.name]))(rest);
        }

        return '';
    }

    let toFunc = spec =>
    {
        // converter function for document entity
        if (typeof spec === 'function') return data => inter(spec(data, vars), data);        
        // string interpolation for document entity
        if (typeof spec === 'string') return data => inter(spec, data)        
        // suppress output for document entity
        return () => ''
    }
    
    let insert = re.g(interpolate.vars);
    let sects = re.g(interpolate.sections);
    let check = (one, two) => one === two ? '' : two
    
    let inter = (str, data) =>
    {
        let reps = { ...vars, ...data };
        let solve = value => typeof value === 'function' ? value(data) : value

        let doVars = str => str.replace(insert, (match, name, def) => solve(op.get(reps, name)) ?? def ?? match)
        let doSects = str => str.replace(sects, (...args) => check(args[1], doVars(args[1])))

        while (sects.test(str)) { str = doSects(str); }

        return doVars(str);
    }

    return finalize;
}
