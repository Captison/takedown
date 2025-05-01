import res from '../lib/action-response'


/*
    Code span inline.
*/
export default
{
    type: 'inline',
    order: 10,
    priority: 10,

    regex:
    {
        open: s => [ `${s.ne}(?<!\`)(?<ticks>\`+)(?!\`)(?<text>.+?)(?<!\`)\\k<ticks>(?!\`)`, 's' ],
        spaced: /^ (\s*[^\s].*) $/,
    },

    action: part => res.consume(part),

    compile(content, state)
    {
        let { ticks, text } = content.join('').match(state.openRe).groups;
        return { ticks, value: text };
    }
}
