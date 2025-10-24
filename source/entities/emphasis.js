
/*
    Emphasis and strong inlines.
*/
export default
{
    order: 30, 
    priority: 30,

    nestable: [ 'autolink', 'code', 'email', 'emphasis', 'image', 'linebreak', 'link' ],

    pattern: 'inline-decorate-content',
    patternData:
    {
        simpChar: '*',
        compChar: '_',
        single: 'emphasis',
        double: 'strong'
    },

    delouse: 
    {
        value: [ 'common' ]
    }
}
