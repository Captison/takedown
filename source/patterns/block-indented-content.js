import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-indented-content
    @type block
    @outputs
      - `value`: captured text

    @description
      Based on CommonMark *indented blocks*.
      <https://spec.commonmark.org/0.31.2/#indented-code-blocks>

    @param { object } data
      - `rejectOnForcedClose`
*/
export default function ({ rejectOnForcedClose })
{
    let open = `(?<=^|\\n)${s.ic}${s.sot}*[^\\s]`;
    let prune = `^${s.ic}`;

    let pattern =
    {
        state: { rejectOnForcedClose },
        
        regex: { open, prune, blank: s.bl, nonBlank: [ s.nbl, 'm' ] },

        moveAhead(line, state)
        {
            let clipped = this.stream.use(state.nonBlankRe, line.endex).clip();
            if (clipped)
            {
                let { pruned } = this.getPruning(clipped);
                if (state.openRe.test(pruned)) return true;
            }
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

        compile: true
    }

    return pattern;
}
