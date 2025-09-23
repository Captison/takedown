
/**
    Creates a proxy with a caching getter.

    Once `func` returns something other than `undefined` for a given
    property accessor, from then on that value will be cached and returned for 
    subsequent accesses to that property.

    @param { any } on
      Value to be proxied.
    @param { function } func
      Called to get value for a property of `on`.
    @return { Proxy }
      Proxy object.
*/
export default function proxet(on, func)
{
    return new Proxy(on,
    { 
        get(target, prop) 
        {
            // simply return value if `target` already has `prop` defined
            if (Object.hasOwn(target, prop)) return target[prop];

            let value = func(prop, target);
            // return and assign resulting value (cache)
            if (typeof value !== 'undefined') return target[prop] = value;   
        },
        // silent fail... no setting allowed!
        set() 
        {
            return true; 
        }
    });
}
