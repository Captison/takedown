
/*
    List block.
*/
export default
{
    order: 20,
    priority: 31,

    nestable: [ 'listitem' ],

    pattern: 'block-list-container',
    patternData: 
    {
        continuator: true,
        rejectOn: [ 'divide', 'header', 'quotation' ],
        rejectOnForcedClose: true,
        ordered: 'olist',
        unordered: 'ulist'
    }
}
