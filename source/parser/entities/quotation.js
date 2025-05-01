import res from '../lib/action-response'


/*
    Quotation block.

    Quotation blocks can be closed by:
    - a blank line
    - thematic break
    - list item
*/
export default 
{
    type: 'block',
    order: 30,
    priority: 20,

    nestable:
    [ 
        'arbitag',
        'autolink', 
        'code', 
        'codeblock',
        'codefence', 
        'divide', 
        'email', 
        'emphasis', 
        'header', 
        'html',
        'htmlblock',
        'image',
        'linebreak',
        'link', 
        'list',
        'paragraph',
        'quotation', 
        'reference', 
        'setext',
    ],

    state:
    {
        rejectOn: [ 'codefence', 'divide', 'list' ],
        rejectOnForcedClose: true
    },

    regex: s =>
    ({
        open: [ `${s.sol}> ?`, 's' ],
        prune: `${s.mi}> ?`,
        blank: /^\s*\n/
    }),

    prune(line, state)
    {
        let { stream } = this;

        let clip = stream.use(state.pruneRe, line.index).clip();
        // return end slice if we have found our opening marking
        if (clip?.index === line.index) return stream.slice(clip.endex, line.endex);
        // we cannot prune this line
        return null;
    },

    action:
    {
        open(line) { return res.accept(this.getPruning(line).pruned); },
        
        next(line, state)
        {
            let { marked, pruned } = this.getPruning(line);
            
            // when line doesn't have markings up to our level...
            if (!marked)
            {
                // reject when on a blank line
                if (state.blankRe.test(pruned)) return res.reject();
                // reject when not in continuation
                if (!this.current.model.continuator) return res.reject();
                // reject when interrupting blocks can open
                if (this.opens(line, ...state.rejectOn)) return res.reject();
                // requires marker to continue if last line was blank
                if (state.lastBlank) return res.reject();
            }
            // track the last blank line in our content
            state.lastBlank = state.blankRe.test(pruned);

            return res.accept(pruned);
        }
    },

    compile: true,

    delouse: [ 'trimEnd' ]
}
