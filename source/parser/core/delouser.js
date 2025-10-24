import is from '#lib/is.js'
import re from '#lib/re.js'


export default function (config)
{
    /*
        Makes a replacer function.
    */
    let makeRepFn = spec =>
    {
        let { search, replace } = spec, replacer = replace;
        
        if (is.func(replace))
        {
            replacer = (match, ...caps) => 
            {
                let string = caps.pop(), offset = caps.pop(), groups = {};
                
                if (is.nonao(string))
                    ([ groups, string, offset ] = [ string, offset, caps.pop() ])

                return replace({ match, caps, string, offset, ...groups });
            }
        }

        return str => str.replace(re(search), replacer);
    }

    let makeReps = (name, list = []) =>
    {
        let spec = config.delousers[name];
        // for combination delousers (multiple delouse functions)
        if (Array.isArray(spec)) 
            spec.forEach(name => makeReps(name, list));
        else // spec should be an object
            list.push(makeRepFn(spec));

        return list;
    }

    let cache = {};
    let reducer = (str, name) => (cache[name] ??= makeReps(name)).reduce((str, fn) => fn(str), str)

    return (data, spec) =>
    {
        let obj = { ...data };

        if (spec)
        {
            // top-level delousing config applies to `value`
            if (Array.isArray(spec)) spec = { value: spec };
            Object.keys(obj).forEach(k => Array.isArray(spec[k]) && (obj[k] = spec[k].reduce(reducer, obj[k])));
        }

        return obj;
    }
}
