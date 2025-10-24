
/*
    Link inline.
*/
export default
{
    order: 20,
    priority: 20,

    nestable: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'image', 'link' ],

    pattern: 'inline-linked-element',

    delouse:
    {
        value: [ 'common' ],
        href: [ 'uri' ],
        title: [ 'common' ]
    }
}
