
/*
    Hard line break inline.
*/
export default
{
    order: 50,
    priority: 50,

    pattern: 'inline-atomic-segments',
    patternData:
    {
        segments: [ '(?:  +|\\\\)\\n' ]
    }
}
