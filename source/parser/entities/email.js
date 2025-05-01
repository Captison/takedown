import res from '../lib/action-response'


/*
    Email inline.
*/
export default
{
    type: 'inline',
    order: 10,
    priority: 10,

    regex:
    {
        open: s => `<(?<email>${s.ea})>`,
    },

    action: part => res.consume(part),

    compile(content, state)
    {
        let { email } = content.join('').match(state.openRe).groups;
        return { email, value: email };
    },

    delouse:
    {
        value: [ 'amperChar=>amperEnt' ],
        email: [ 'amperChar=>amperEnt' ]
    }
}
