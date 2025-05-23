import res from '../lib/action-response.js'


/*
    Header block.
*/
export default
{
    type: 'block',
    order: 20,

    regex:
    {
        open: s => `${s.sol}(?<marks>${s.oah})(?:${s.sot}+(?<text>(?!#+\\s*\\n).+?))?(?:${s.sot}+#*)?\\s*${s.eol}`
    },

    action(line) { return res.consume(this.getPruning(line)[0]); },

    compile(content, state)
    {
        let { marks, text = '' } = content.join('').match(state.openRe).groups;
        return { level: marks.length, chunks: text };
    },

    delouse: [ 'standard' ]
}
