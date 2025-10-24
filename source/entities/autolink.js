
/*
    Autolink inline.
*/
export default
{
    order: 10,
    priority: 10,

    pattern: 'inline-url-autolink',

    delouse:
    {
        value: [ 'htmlEntsToChars', 'commonHtmlEnts' ],
        url: [ 'htmlEntsToChars', 'encodeUriChars', 'commonHtmlEnts' ]
    }
}
