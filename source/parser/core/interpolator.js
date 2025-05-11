import op from '../lib/object-path'
import re from "../lib/re";


export default function (config)
{
    let { interpolation, vars } = config;

    let varis = re.g(interpolation.variables);
    let sects = re.g(interpolation.segments);
    let check = (one, two) => one === two ? '' : two
    
    return (str, data) =>
    {
        str ??= '';

        let reps = { ...vars, ...data };
        let solve = value => typeof value === 'function' ? value(data) : value

        let doVars = str => str.replace(varis, (match, name, def) => solve(op.get(reps, name)) ?? def ?? match)
        let doSects = str => str.replace(sects, (...args) => check(args[1], doVars(args[1])))

        while (sects.test(str)) { str = doSects(str); }

        return doVars(str);
    }
}
