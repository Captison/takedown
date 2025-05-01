import res from '../lib/action-response'


/*
    Setext header block.
*/
export default
{
    type: 'block',
    order: 41,

    nestable: 
    [ 
        'autolink', 
        'code', 
        'emphasis', 
        'html', 
        'image',
        'linebreak', 
        'link', 
    ],

    state:
    {
        abortOn: [ 'divide', 'header', 'list', 'quotation' ]
    },

    regex:
    {
        open: s => [ `${s.sol}(?<text>[^\\s].*)${s.eol}`, 's' ],
        // prune: s => `^${s.mi}`,
        close: s => [ `^${s.mi}(?<type>=+|-+)\\s*$`, 's' ],
        // full: /^(?<text>.+?)\n(?<type>=+|-+)\s*$/s,
        blank: /^\s*\n/
    },

    action:
    {
        open(line) { return res.accept(this.getPruning(line).pruned.trimStart()); },

        next(line, state)
        {
            let { pruned } = this.getPruning(line);

            // abort on blank line
            if (state.blankRe.test(pruned)) return res.abort();
            // close on setext markings
            if (state.closeRe.test(pruned)) 
            {
                state.type = pruned.match(state.closeRe).groups.type;
                return res.consume();
            }
            // reject on other blocks (divide must be tested after setext)
            if (this.opens(pruned, ...state.abortOn)) return res.abort();
            // trim spaces from bginning of line
            return res.accept(pruned.trimStart());
        }
    },

    compile: (content, state) =>
    {
        let level = state.type[0] === '=' ? 1 : 2;
        return { name: 'setext', level, chunks: content.join('').trimEnd() };
    },

    delouse: [ 'standard', 'commonChar=>commonEnt' ]
}
