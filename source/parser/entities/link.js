import linked from './base/linked.js'


/*
    Link inline.
*/
export default
{
    mixes: [ linked ],

    removeSameAncestor: true,

    state:
    {
        name: 'link'
    },

    regex:
    {
        open: s => `${s.ne}\\[(?=.*?${s.ne}\\])`
    }
}
