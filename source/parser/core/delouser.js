import re from '#lib/re.js'


export default function (config, inter)
{
    let { delouse, delousers } = config;

    /*
        Makes a replacer function.
    */
    let makeRepFn = spec =>
    {
        let { search, replace } = spec;
        // create regex from search spec
        let regex = re(search);
        // create an interpolation function from replace spec
        let repfun = inter.toFunc(replace);
        // create the final replacer function
        let replacer = (match, ...a) => 
        {
            let last = a.pop();
            // named capture groups are part of data interpolation payload
            return repfun({ match, ...(typeof last === 'object' ? last : {}) });
        }

        return str => str.replace(regex, replacer);
    }

    let makeReps = (name, list = []) =>
    {
        let spec = delousers[name];
        // for combination delousers (multiple delouse functions)
        if (Array.isArray(spec)) 
            spec.forEach(name => makeReps(name, list));
        else // spec should be an object
            list.push(makeRepFn(spec));

        return list;
    }

    let cache = {};
    let reducer = (str, name) => (cache[name] ??= makeReps(name)).reduce((str, fn) => fn(str), str)

    return data =>
    {
        let { name, ...obj } = { ...data }, spec = delouse[name];

        if (spec)
        {
            // top-level delousing config applies to `value`
            if (Array.isArray(spec)) spec = { value: spec };
            Object.keys(obj).forEach(k => Array.isArray(spec[k]) && (obj[k] = spec[k].reduce(reducer, obj[k])));
        }

        return { name, ...obj };
    }
}
