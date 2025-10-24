
/*
    Code span inline.
*/
export default
{
    order: 10,
    priority: 10,

    pattern: 'inline-char-enclosure',
    patternData: { char: '`' },

    delouse:
    {
        value: [ 'lineEndToSpace', 'trimEncSpace', 'commonHtmlEnts' ]
    }
}
