import collate from './collate.js'
import producer from './producer.js'


/*
    Markdown Entity provider (madoe).
*/
export default function (config)
{
    let { entities } = config;
    let { raw, mix, setup } = producer(config);
    let { delims } = collate(entities, raw);

    let cache = {};
    let proxie = item =>
    {
        // configured entity (cached types)
        if (typeof item === 'string') return cache[item] ??= setup(item);
        // already built entity
        if (item?.entity) return item;
        // custom entity
        return setup(item);
    }

    proxie.custom = mix;
    proxie.block = [ /.*?\n/g ];
    proxie.inline = delims;

    return proxie;
}
