import res from '#lib/action-response.js'
import re from '#lib/re.js'
import s from '#lib/reparts.js'


/**
    @name block-pair-enclosure
    @type block
    @outputs
      - `value`: captured text

    @description
      Block is opened and closed by a matching pair.

      An abstraction of CommonMark *html blocks*.
      <https://spec.commonmark.org/0.31.2/#html-blocks>

    @param { object } data
      - `pairs`: array of open and close regular expressions
      - `rejectOnForcedClose`
*/
export default function ({ pairs, rejectOnForcedClose })
{
    let remap = pairs.map(pair => pair.map(part => re(part)));
    let opens = pairs.map(pair => pair[0]);

    let open = `${s.sol}(?:${opens.join('|')})`;
    let prune = `^${s.mi}`;

    let pattern =
    {    
        state: { rejectOnForcedClose },

        regex: { open, prune, blank: s.bl },

        action:
        {
            open(line, state)
            {
                let { pruned } = this.getPruning(line);
                let undented = pruned.replace(state.pruneRe, '');

                let [ open, close ] = remap.find(pair => pair[0].test(undented)) || [];

                if (open)
                {
                    state.closeRe = close;
                    // close on opening line if closing regex also matches
                    if (state.closeRe.test(pruned)) return res.consume(pruned);

                    return res.accept(pruned);
                }
                // for safety, but this should not happen
                return res.abort();
            },

            next(line, state)
            {
                let { pruned } = this.getPruning(line);
                // consume only empty string when closing line is blank
                if (state.closeRe.test(pruned))
                    return res.consume(state.blankRe.test(pruned) ? '' : pruned);
                
                return res.accept(pruned);
            }
        },

        compile: true
    }

    return pattern;
}
