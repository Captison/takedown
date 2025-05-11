import TakedownError from '../error/TakedownError'

/**
    Creates a function that can construct a restricted object.

    @param { object } prints
      "Blueprints" for the restricted object.
    @return { Proxy }
      Restricted object.
*/
export default function(prints, notify)
{
    notify ??= () => void 0

    let proxer = (prints, notify, name) =>
    {
        let id = next => !name && next === 'config' ? null : name ? `${name}.${next}` : next

        return new Proxy({}, 
        {
            set(target, prop, value)
            {
                let nonao = typeof value === 'object' && !Array.isArray(value) && value !== null;
                let spec = prints[prop] || prints['{*}'] || (nonao ? {} : void 0);
                let name = id(prop), message = null, final = value;

                if (typeof spec === 'object')
                {
                    if (nonao)
                    {
                        final = target[prop] || proxer(spec, notify, name);
                        Object.keys(value).forEach(k => final[k] = value[k]);
                    }
                    else if (typeof spec[$validate] === 'function')
                    {
                        message = spec[$validate](value, name);
                    }
                    else
                    {
                        message = `${name} is not of valid type`;
                    }
                }
                else if (typeof spec === 'function')
                {
                    message = spec(value, name);
                }

                if (typeof message === 'string') 
                    throw new TakedownError(`config: ${message}`);

                target[prop] = final;
                notify();

                return true;
            }
        });
    }

    return proxer(prints, notify);
}

export let $validate = Symbol();
