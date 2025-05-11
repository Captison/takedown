import * as entities from '../../entities'


let mix = (ent, ...mixes) =>
{
    let spec = ent;

    if (typeof ent === 'string')
    {
        spec = entities[ent];
        spec.name ??= ent;
    }

    if (spec.mixes) mixes = [ ...spec.mixes, ...mixes ];
    return mixit(spec, mixes.length ? mix(...mixes) : {});
}

let mixit = (main, mixed) =>
{
    let { delims, regex, state, ...rest } = main;

    let mix =
    {
        ...mixed,
        ...rest,
        delims: [ ...(delims || []), ...(mixed.delims || []) ],
        regex: { ...mixed.regex, ...regex },
        state: { ...mixed.state, ...state },
    };

    return mix;
}

export default mix;
