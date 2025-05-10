import compile from './compile'
import delouser from './delouser'


export default function (config, inter)
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
            rest.index = index;

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

    let withVars = interpolate.converters;

    let toFunc = spec =>
    {
        // converter function for document entity
        if (typeof spec === 'function') return data => inter(spec(data, vars), data, withVars);        
        // string interpolation for document entity
        if (typeof spec === 'string') return data => inter(spec, data, withVars)        
        // suppress output for document entity
        return () => ''
    }

    return finalize;
}
