
/*
    Fenced code block.
*/
export default
{
    order: 10,

    pattern: 'block-atomic-fence',
    patternData:
    {
        chars: '`~',
        restrictChars: '`',
        rejectOnForcedClose: true,
    },

    delouse: 
    {
        value: [ 'commonHtmlEnts' ],
        info: [ 'common' ]
    }
}
