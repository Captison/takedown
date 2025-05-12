import res from '../lib/action-response.js'
import setext from './setext.js'


/*
    Paragraph block.

    Paragraphs can be closed by any other block-level entity.

    Setext headers are also handled here.
*/
export default
{
    type: 'block',
    order: 40,
    continuator: true,

    state:
    {
        rejectOn: [ 'codefence', 'divide', 'header', 'htmlblock', 'quotation' ],
        rejectOnForcedClose: true
    },

    regex:
    {
        open: s => [ `${s.sol}[^\\s].*${s.eol}`, 's' ],
        setext: setext.regex.close,
        blank: /^\s*\n/,
        // list paragraph interrupt
        listMark: s => `^${s.mi}(?:[-+*]|[aA1][.)])(?:${s.sot}|$)`
    },
    
    action:
    {
        open(line) 
        { 
            return res.accept(this.getPruning(line).pruned.trimStart());
        },
        
        next(line, state)
        {
            let { pruned, at } = this.getPruning(line);
            // reject on blank line
            if (state.blankRe.test(pruned)) return res.reject();
            // abort on properly pruned setext header markings
            if (at === 0 && state.setextRe.test(pruned)) return res.abort();
            // reject on interrupting blocks (divide tested after setext)
            if (this.opens(line, ...state.rejectOn)) return res.reject();
            // listitems are special and can only interrupt in specific cases
            if (state.listMarkRe.test(pruned)) return res.reject();
            // trim spaces from bginning of line
            return res.accept(pruned.trimStart());
        }
    },

    compile: content => ({ chunks: content.join('').trimEnd() })
}
