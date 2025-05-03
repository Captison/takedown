import reparts from './reparts'


/*
    A function to help make regular expression instances.
*/
let make = (def, flags) =>
{
    // provide re parts when function
    if (typeof def === 'function')
        return make(def(reparts), flags);
    
    // merge flags when array
    if (Array.isArray(def))
        return make(def[0], mergeflags(def[1], flags));
    
    // merge flags when RegExp object
    if (def instanceof RegExp)
        return new RegExp(def, mergeflags(def.flags, flags));

    // create new re
    return new RegExp(def, flags);
}

// get a set of unique regex flags from `a` and `b`
let mergeflags = (a, b) => a && b ? [ ... new Set((a + b).split('')) ].join('') : a || b

let esc = /[-\[\]{}()*+!<=>:?.\/\\^$|#\s,"]/g;
make.esc = string => string.replace(esc, '\\$&')
make.test = (re, str, idx = 0) => (re.lastIndex = idx, re.test(str))

// export a proxy that allows flag setting via a property
export default new Proxy(make, 
{ 
    get(target, prop) 
    { 
        if (Object.hasOwn(target, prop)) 
            return target[prop];
        
        return def => make(def, prop)
    } 
});
