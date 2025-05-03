import build from './build'
import { inlineDelimiters } from './entity-meta'


let cache = {};
let proxie = name =>
{
    // configured entity is requested (cached types)
    if (typeof name === 'string') return cache[name] ??= build({ name }, name);
    // assume already built entity
    if (name?.entity) return name;
    // assemble a custom entity
    return build(name);
}

proxie.custom = build;

let orderSort = (a, b) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0

/*
    Filter and sort nestable types for entity.

    These inter-entity references must be separately (and somewhat lazily) 
    resolved as they depend on each other.
*/
proxie.withNesters = entity =>
{
    if (!entity.nesters)
    {
        let { type, nestable = [] } = entity;

        let reducer = (arr, name) =>
        {
            let ent = proxie(name);
            return type === ent.type ? [ ...arr, ent ] : arr;
        }
    
        entity.nesters = nestable.reduce(reducer, []).sort(orderSort);    
    }

    return entity;
}

proxie.block = [ /.*?\n/g ];
proxie.inline = inlineDelimiters;

export default proxie;
