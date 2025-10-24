
/*
    Paragraph block.
*/
export default
{
    order: 40,

    nestable: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'image', 'linebreak', 'link' ],

    pattern: 'block-paragraph-content',
    patternData:
    {
        chars: '=-',
        continuator: true,
        rejectOn: [ 'divide', 'fenceblock', 'header', 'htmlblock', 'quotation' ],
        rejectOnForcedClose: true
    },

    delouse:
    {
        value: [ 'trimAroundNewline', 'common' ]
    }
}
