import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-setext-underscore
    @type block
    @outputs
      - `level`: index of control character in `chars` plus one
      - `value`: captured text

    @description
      Block of text closed by a line of characters (one of `chars`).

      An abstraction of CommonMark *setext headings*.
      <https://spec.commonmark.org/0.31.2/#setext-headings>

    @param { object } data
      - `abortOn`: array of interrupting block entity names
      - `chars`: underlining characters (each character in string is used)
*/
export default function ({ abortOn, chars })
{
    let m = chars.split('').map(char => `${RegExp.escape(char)}+`).join('|');

    let open = [ `${s.sol}(?<text>[^\\s].*)${s.eol}`, 's' ];
    let close = [ `^${s.mi}(?<type>${m})\\s*$`, 's' ];

    let pattern =
    {
        state: { abortOn },

        regex: { open, close, blank: s.bl },

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
            let level = chars.indexOf(state.type[0]) + 1;
            return { level, chunks: content.join('').trimEnd() };
        }
    }

    return pattern;
}
