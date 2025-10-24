
/*
    Link inline.
*/
export default
{
    order: 20,
    priority: 20,

    nestable: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'image', 'link' ],

    pattern: 'inline-linked-element',
    patternData: { image: true },

    delouse:
    {
        value: [ 'common' ],
        href: [ 'uri' ],
        title: [ 'common' ]
    }
}
