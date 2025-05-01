import res from '../lib/action-response'


/*
    Codefence block.
*/
export default
{
    type: 'block',
    order: 10,

    state:
    {
        rejectOnForcedClose: true,

        cut: ct => 
        {
            let re = new RegExp(`^ {0,${ct}}`);
            return line => line.replace(re, '')
        }
    },

    regex:
    {
        open: s => `(?<indent>${s.sol})(?<fence>${s.ofb})(?<info>.*)${s.eol}`,
        indent: s => `^${s.mi}`
    },

    action:
    {
        open(line, state)
        {
            let [ pruned ] = this.getPruning(line);

            let { indent, fence } = pruned.match(state.openRe).groups;
            // block is closed with same or greater fence length
            state.closeRe = new RegExp(`^${fence[0]}{${fence.length},}\\s*$`);
            state.unIndent = state.cut(indent.length);
            // keep the unindented line
            return res.accept(state.unIndent(pruned));
        },

        next(line, state)
        {
            let { pruned } = this.getPruning(line); 
            // reject when not properly pruned (non-continuation)
            // if (pruned === null) return res.reject();

            // consume on closing marks (of any indentation)
            if (state.closeRe.test(pruned.replace(state.indentRe, ''))) 
                return res.consume();
            // accept any other line removing opening indentation
            return res.accept(state.unIndent(pruned));
        }
    },

    compile(content, state)
    {
        let { fence, info } = content[0].match(state.openRe).groups;
        let value = content.slice(1).join('');

        return { name: 'fenceblock', fence, info, value }; 
    },

    delouse: 
    {
        value: [ 'commonChar=>commonEnt', 'amperChar=>amperEnt' ],
        info: [ 'standard' ]
    }
}
