import is from '#lib/is.js'
import orderSort from '#lib/order-sort.js'
import res from '#lib/action-response.js'
import re from '#lib/re.js'
import * as patterns from '#source/patterns/index.js'


export default function (config)
{
    let { entities } = config;

    let getType = name => entities[name].pattern.split('-')[0]
    let entSort = (a, b) => orderSort(entities[a], entities[b])


    let raw = name =>
    {
        if (raw.cache[name]) return raw.cache[name];

        let type = getType(name);
        let { nestable, pattern, patternData, ...other } = entities[name];
        let entity = { nestable, ...patterns[pattern](patternData), ...other };

        entity.name ||= name;
        // entity.raw = true;
        entity.type = type;
        entity.order ??= 1000000;
        entity.priority ??= 1000000;

        if (type === 'inline')
        {
            entity.delims ||= [];
            if (entity.regex?.open) entity.delims.unshift(entity.regex.open);
        }

        return raw.cache[name] = entity;
    }
    raw.cache = {};


    /*
        Assembles a static markdown entity definition.
    */
    let setup = spec =>
    {
        if (is.string(spec)) spec = raw(spec)

        let { compile, regex = {}, state = {}, ...entity } = spec;

        entity.entity = true;
        // delete entity.raw;

        // Regex
        // ----------------------------------------
        Object.keys(regex).forEach(key => state[`${key}Re`] = re(regex[key]));
        entity.state = state;


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
        entity.compile = typeof compile !== 'function' ? () => compile : compile;
        

        // Nesting
        // ----------------------------------------
        if (entity.nestable && !entity.nesters)
        {
            let { type, nestable } = entity;
            entity.nesters = nestable.filter(n => getType(n) === type).sort(entSort)
        }

        return entity;
    }


    let mix = (ent, data) =>
    {
        let spec = is.string(ent) ? raw(ent) : ent;
        let { delims, regex, state, ...rest } = spec;

        let mixed =
        {
            ...data,
            ...rest,
            delims: [ ...(delims || []), ...(data?.delims || []) ],
            regex: { ...data?.regex, ...regex },
            state: { ...data?.state, ...state },
        };

        return mixed;
    }


    return { mix, raw, setup };
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
