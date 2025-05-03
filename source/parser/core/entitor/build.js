import res from '../../lib/action-response'
import re from '../../lib/re'
import mixer from './mixer'


/*
    Assembles a static markdown entity definition.
*/
function build(spec)
{
    let { order, priority, regex, state, ...entity } = spec;

    regex ??= {};
    state ??= {};

    entity.entity = true;
    entity.order = order ?? 1000000;
    entity.priority = priority ?? 1000000;
    entity.state = state;


    // Regex
    // ----------------------------------------
    Object.keys(regex).forEach(key => state[`${key}Re`] = re(regex[key]));


    // Open
    // ----------------------------------------
    if (!entity.open && state.openRe)
    {
        if (entity.type === 'block')
        {
            entity.open = function (chunk)
            {
                let { 1: parepruned } = this.getPruning(chunk);
                return parepruned ? state.openRe.test(parepruned) : false;
            }
        }
        else
        {
            let openRe = re.y(state.openRe);

            entity.open = function (chunk)
            {
                return chunk ? !! this.stream.use(openRe, chunk.index).clip() : false;
            }
        }
    }


    // Prune
    // ----------------------------------------
    entity.prune ??= chunk => chunk


    // Action
    // ----------------------------------------
    if (typeof entity.action === 'object')
    {
        let action = entity.action;

        entity.action = function (chunk, state)
        {
            // remaining chunks
            if (state.__open) return action.next.call(this, chunk, state)

            // opening chunk
            if (!state.__open)
            {
                state.__open = true;
                return action.open.call(this, chunk, state)
            }
        };
    }

    entity.action = chunkCaching(entity.action || (chunk => res.accept(chunk)), 'action');


    // Close
    // ----------------------------------------
    entity.close ??= () => true


    // Compile
    // ----------------------------------------
    let compile = entity.compile;
    
    entity.compile = typeof compile !== 'function' ? () => compile : compile;


    // Delouse
    // ----------------------------------------
    let delouse = entity.delouse;

    if (Array.isArray(delouse))
    {
        entity.delouse = (data, dl) => 
        {
            if (data.value?.length) 
                data.value = dl(...delouse)(data.value);

            return data;
        }
    }
    else if (typeof delouse === 'object')
    {
        entity.delouse = (data, dl) =>
        {
            for (let name in data)
            {
                // `spec` can only be function or array
                let spec = delouse[name], value = data[name];
                if (value?.length && spec)
                    data[name] = Array.isArray(spec) ? dl(...spec)(value) : spec(value, dl);                        
            }

            return data;
        }
    }

    entity.delouse ??= data => data


    return entity;
}


export default function (...mixes) 
{ 
    return build(mixer(...mixes)); 
}


/*
    Caches the result of a chunk handling operation to entity state.
*/
let chunkCaching = (fn, label) =>
{
    return function(chunk, state, ...args)
    {
        return state[`__${chunk.id}:${label}`] ??= fn.call(this, chunk, state, ...args);
    }
}
