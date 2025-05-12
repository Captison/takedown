import linked from './base/linked.js'


/*
    Image inline.
*/
export default
{
    mixes: [ linked ],

    state:
    {
        name: 'image'
    },

    regex:
    {
        open: s => `${s.ne}!\\[(?=.*?${s.ne}\\])`
    }
}
