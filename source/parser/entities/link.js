import linked from './base/linked'


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
