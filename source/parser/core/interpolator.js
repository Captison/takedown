import op from '#lib/object-path.js'
import re from "#lib/re.js";


export default function (config)
{
    let { interpolation, vars } = config;

    let varis = re.g(interpolation.variables);
    let sects = re.g(interpolation.segments);
    let check = (one, two) => one === two ? '' : two
    
    let inter = (str, data) =>
    {
        str ??= '';

        let reps = { ...vars, ...data };
        let solve = value => typeof value === 'function' ? value(data) : value

        let doVars = str => str.replace(varis, (match, name, def) => solve(op.get(reps, name)) ?? def ?? match)
        let doSects = str => str.replace(sects, (...args) => check(args[1], doVars(args[1])))

        while (sects.test(str)) { str = doSects(str); }

        return doVars(str);
    }

    /*
        Creates an interpolation function from a `spec`.

        The spec can be a string or function.
    */
    inter.toFunc = spec =>
    {
        // spec function is called with data and vars
        if (typeof spec === 'function') return data => inter(spec(data, vars), data);        
        // spec string is directly interpolated
        if (typeof spec === 'string') return data => inter(spec, data)        
        // no output for invalid spec
        return () => ''
    }

    return inter;
}
