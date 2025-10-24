
/*
    Quotation block.
*/
export default 
{
    order: 30,
    priority: 20,

    nestable:
    [ 
        'arbitag', 'codeblock', 'divide', 'fenceblock', 'header', 
        'htmlblock', 'list', 'paragraph', 'quotation', 'reference', 
        'setext'
    ],

    pattern: 'block-char-container',
    patternData:
    { 
        char: '>',
        rejectOn: [ 'divide', 'fenceblock', 'list' ],
        rejectOnForcedClose: true
    },

    delouse: 
    {
        value: [ 'trimEnd' ]
    }
}
