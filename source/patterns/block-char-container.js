import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-char-container
    @type block
    @outputs
      - `value`: captured text

    @description
      Based on CommonMark *block quotes*.
      <https://spec.commonmark.org/0.31.2/#block-quotes>

    @param { object } data
      - `char`: demarcating character (only 1st char in string used)
      - `rejectOn`: array of interrupting block entity names
      - `rejectOnForcedClose`
*/
export default function ({ char, rejectOn, rejectOnForcedClose })
{
    let c = RegExp.escape(char[0]);

    let open = [ `${s.sol}${c} ?`, 's' ];
    let prune = `${s.mi}${c} ?`;

    let pattern =
    {
        state: { rejectOn, rejectOnForcedClose },

        regex: { open, prune, blank: s.bl },

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
    };

    return pattern;
}
