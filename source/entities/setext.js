
/*
    Setext header block.
*/
export default
{
    order: 41,

    nestable: [ 'autolink', 'code', 'emphasis', 'html', 'image', 'linebreak', 'link' ],

    pattern: 'block-setext-underscore',
    patternData:
    {
        chars: '=-',
        abortOn: [ 'divide', 'header', 'list', 'quotation' ]
    },

    delouse:
    {
        value: [ 'trimAroundNewline', 'common' ]
    }
}
