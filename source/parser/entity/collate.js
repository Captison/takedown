import orderSort from '#lib/order-sort.js'


export default function (ents, xlate)
{
    let delims = [];

    let add = del => !delims.includes(del) && delims.push(del)

    for (let key of Object.keys(ents).sort((a, b) => orderSort(ents[a], ents[b])))
    {
        let { pattern } = ents[key];

        if (pattern.startsWith('inline'))
            xlate(key).delims.forEach(add);   
    }

    return { delims };
}
