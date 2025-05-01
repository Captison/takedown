import { entity } from '../../../config/structure'
import restrict from '../../../config/restrict'
import reparts from '../../lib/reparts'
import build from './build'
import mixer from './mixer'


/**
    Builds out entity definitions with defaults and conveniences.
*/
export default function (config)
{
    let { entities } = config;

    let mixin = mixer(entities, reparts);

    let cache = {};
    let custom = (...mixes) => build(mixin(...mixes))
    
    let proxie = name =>
    {
        // configured entity is requested (cached types)
        if (typeof name === 'string') return cache[name] ??= custom({ name }, entities[name]);
        // return already built entity
        if (name?.entity) return name;
        // assemble a custom entity
        return custom(name);
    }

    proxie.custom = custom;
    // filter by type and sort by order
    proxie.filterSort = (type, list) =>
    {
        let reducer = (arr, name) =>
        {
            let ent = proxie(name);
            if (type === ent.type) arr.push(ent);
            return arr;
        }

        return (list || []).reduce(reducer, []).sort(orderSort);
    }
    

    let dels = [];
    Object.keys(entities).forEach(name =>
    {
        let ent = mixin(name);
        // validate entity config
        restrict({ entities: { [name]: entity } }).entities = { [name]: ent };

        if (ent.type === 'inline')
        {
            let { delims = [], regex: { open } } = ent;
            // add open regex to delimiters (if existing)
            if (open) delims = [ open, ...delims ];
            
            delims.forEach(del => !dels.includes(del) && dels.push(del));
        }
    });

    proxie.block = [ /.*?\n/g ];
    proxie.inline = dels;

    return proxie;
}

let orderSort = (a, b) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0
