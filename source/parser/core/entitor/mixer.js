import * as entities from '../../entities'
import reparts from '../../lib/reparts'


let mixer = (ent, ...mixes) =>
{
    let spec = solve(ent);
    // set name for a named entity if not present
    if (typeof ent === 'string') spec.name ??= ent;

    return mix(spec, mixes.length ? mixer(...mixes) : {});
}

let solve = ent =>
{
    if (typeof ent === 'string') return solve(entities[ent]);   
    if (typeof ent === 'function') return solve(ent(reparts));
    // ent should be an object now
    return ent;
}

let mix = (main, mixed) =>
{
    let { delims, regex, state, ...rest } = main;

    if (typeof delims === 'function') delims = delims(reparts);
    if (typeof regex === 'function') regex = regex(reparts);

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

export default mixer;
