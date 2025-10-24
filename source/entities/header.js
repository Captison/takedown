
/*
    Header block.
*/
export default
{
    order: 20,

    nestable: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'link' ],    

    pattern: 'block-char-capture',
    patternData: { char: '#' },

    delouse: 
    {
        value: [ 'common' ]
    }
}
