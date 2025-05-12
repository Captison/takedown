import res from '../lib/action-response.js'


/*
    Thematic break.
*/
export default
{
    type: 'block',
    order: 20,

    regex:
    {
        open: s => `${s.sol}(?<marks>(?:-${s.sot}*){3,}|(?:_${s.sot}*){3,}|(?:\\*${s.sot}*){3,})\\s*${s.eol}`
    },

    action(line) { return res.consume(this.getPruning(line)[0]); },

    compile(content, state)
    {
        let { marks } = content.join('').match(state.openRe).groups;
        return { marks: marks.replace(/^\s*/, '') };
    }
}
