import res from '../lib/action-response.js'


/*
    Indented code block.
*/
export default
{
    type: 'block',
    order: 30,

    moveAhead(line, state)
    {
        let clipped = this.stream.use(state.nonBlankRe, line.endex).clip();
        if (clipped)
        {
            let { pruned } = this.getPruning(clipped);
            if (state.openRe.test(pruned)) return true;
        }
    },

    state:
    {
        rejectOnForcedClose: true
    },
    
    regex:
    {
        open: s => `(?<=^|\\n)${s.ic}${s.sot}*[^\\s]`,
        prune: s => `^${s.ic}`,
        blank: s => s.bl,
        nonBlank: s => [ s.nbl, 'm' ]
    },

    action(line, state)
    {
        let { pruned } = this.getPruning(line);

        if (state.blankRe.test(pruned))
        {
            let more = this.moveAhead(line, state);
            // accept when more content ahead
            if (more) 
            {
                // preserve extra spaces on blank lines
                if (state.pruneRe.test(pruned)) 
                    return res.accept(pruned.replace(state.pruneRe, ''));

                return res.accept('\n');
            }
            // otherwise we must close now
            return res.reject();
        }

        // accept properly indented lines
        if (this.open(line)) return res.accept(pruned.replace(state.pruneRe, ''));

        return res.reject();
    },

    compile: true,
}
