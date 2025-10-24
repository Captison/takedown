
/*
    List item block.
*/
export default
{
    priority: 30,

    nestable:
    [ 
        'arbitag', 'autolink', 'code', 'codeblock', 'divide', 
        'email', 'emphasis', 'fenceblock', 'header', 'html', 
        'htmlblock', 'image', 'linebreak', 'link', 'list', 
        'paragraph', 'quotation', 'reference', 'setext'
    ],

    pattern: 'block-list-item',
    patternData:
    {
        rejectOn: [ 'divide', 'header', 'list', 'quotation' ],
        rejectOnForcedClose: true
    }
}
