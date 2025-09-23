import TakedownError from '../../error/TakedownError.js'
import is from '../is.js'
import of from '../of.js'
import helpers from './helpers.js'


/**
    Constructs a restricted object.

    Use `assign` to intercept values being set on the controlled object.
    It does not provide control with array mutator operations (push, 
    splice, unshift, etc.).

    `assign` function will receive
    - `apply` - pass this function the value to be assigned
    - `value` - the original value to be assigned
    - `at` - object with spec `path` and actual `name` for value assignment 

    If `apply` throws, no value was assigned.

    @param { object } prints
      Blueprints for the restricted object.
    @param { funcion } assign
      Makes final assessment of the value to be assigned.
*/
export default function (prints, assign)
{
    assign ||= (apply, value) => apply(value)

    /**
        Governs object manipulation to adhere to a set of (blue) `prints`.

        @param { object | array | function } object
          Proxy target object.
        @param { object } at
          Name and path for proxer level.
        @return { Proxy }
          Governed object.
    */
    let proxer = (object, at) =>
    {
        let id = (path, name, value) => 
        {
            if (at)
            {
                name = `${at.name}.${name}`;
                path = `${at.path}.${path}`;
            }

            if (!is.undef(value))
            {
                // new path based on specific type of value
                let testpath = `${path}<${of(value)}>`;
                if (prints[testpath]) path = testpath;
            }            

            return { name, path };
        }

        let propSpec = (target, prop, value) =>
        {
            let toSpec = at => 
            {
                let value = prints[at.path];
                let spec = { at, target, prop };
                
                if (is.func(value)) spec.test = value;
                if (is.plain(value)) spec = { ...value, ...spec };
                if (is.string(value)) spec = toSpec({ ...at, path: value });
                
                return spec;
            }

            let at = id(prop, prop, value);
            return prints[at.path] ? toSpec(at) : toSpec(id('*', prop, value));
        }

        let useDefault = spec => is.undef(spec.default) ? void 0 : verify(spec, spec.default)

        let verifyItems = (target, values, start = 0) => 
        {
            let reducer = (array, value, index) =>
            {
                let spec = propSpec(target, start + index, value);
                let apply = value => array.push(verify(spec, value));

                assign(apply, value, spec.at);
                return array;
            }

            return values.reduce(reducer, []);
        }

        return new Proxy(object, 
        {
            get(target, prop)
            {
                // don't mess with symbols
                if (is.symbol(prop)) return target[prop];
                // validate elements added to arrays
                if (is.array(target))
                {
                    switch (prop)
                    {
                        case 'copyWithin':
                        case 'fill':
                        case 'pop':
                        case 'reverse':
                        case 'shift':
                        case 'sort':
                            return () => { throw new TakedownError(`Unsupported operation ${prop}`); }
                        case 'push':
                            return (...args) => target.push(...verifyItems(target, args, target.length))
                        case 'splice':
                            return (s, d, ...args) => target.splice(s, d, ...verifyItems(target, args, s))
                        case 'unshift':
                            return (...args) => target.unshift(...verifyItems(target, args, 0))
                    }
                }

                if (is.undef(target[prop]))
                {
                    let defval = useDefault(propSpec(target, prop));
                    if (!is.undef(defval)) target[prop] = defval;
                }

                return target[prop];
            },

            set(target, prop, value)
            {
                let spec = propSpec(target, prop, value);
                let apply = value => target[prop] = verify(spec, value);

                assign(apply, value, spec.at);
                return true;
            }
        });
    }

    let verify = ({ at, merge, prop, target, test }, value) =>
    {
        let result = is.func(test) ? test(helpers(at.name, value)) : null;
        // throw if validation error message returned
        if (is.string(result)) throw new TakedownError(result);

        let final = value = is.func(result) ? result() : value;

        if (is.plain(value))
        {                    
            final = (merge && target[prop]) || proxer({}, at);
            Object.keys(value).forEach(k => final[k] = value[k]);
        }                
        else if (is.array(value))
        {
            final = (merge && target[prop]) || proxer([], at);
            final.push(...value);
        }

        return final;
    }

    return proxer(is.array(prints) ? [] : {});
}
