import s from '#lib/reparts.js'

/*
    Html block (type 7).
*/
export default
{
    name: 'htmlblock',

    order: 11,

    pattern: 'block-pair-enclosure',
    patternData:
    {
        pairs:
        [
            // 7. custom tags
            [ `${s.sol}(?=<[^\\n]+?>)(?:${s.hot}|${s.hct})${s.sot}*${s.eol}`, s.bl ]
        ],
        rejectOnForcedClose: true
    }
}
