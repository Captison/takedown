import compile from './compile.js'
import delouser from './delouser.js'


export default function (config, inter)
{
    let delice = delouser(config);
    
    let cache = {};

    return (root, meta) =>
    {
        let finalize = (model, parent, index) => 
        {
            let { id, name, delouse } = model, { chunks, ...rest } = compile(model);

            let data = { id, name, parent, index, meta, ...delice(rest, delouse) };
            // we need to finalize chunks if provided
            if (((data.value ?? null) === null) && (chunks || chunks === '')) 
            {
                let array = [], list = [].concat(chunks);

                data.child =
                {
                    count: list.length,
                    first: list.length ? list[0].name || 'text' : void 0,
                    last: list.length ? list[list.length - 1].name || 'text' : void 0 
                };

                list.forEach((chunk, index) => 
                {
                    let render = chunk.agent ? finalize(chunk, { ...data }, index) : 
                        delice({ value: chunk }, delouse).value;
                        
                    if (render) array.push(render);
                });

                data.value = array.join('');
            }
            
            let output = (cache[data.name] ??= inter.toFunc(config.convert[data.name]))(data);

            config.onConvert?.({ data, output });

            return output;
        }

        return finalize(root.model);
    }
}
