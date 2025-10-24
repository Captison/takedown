import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-paragraph-content
    @type block
    @outputs
      - `value`: captured text

    @description
      Block of text that can be aborted by a line of characters (one of 
      `chars`), or interrupted by named entities in `rejectOn`.

      An abstraction of CommonMark *paragraphs*.
      <https://spec.commonmark.org/0.31.2/#paragraphs>

    @param { object } data
      - `chars`: underlining characters (each character in string is used)
      - `continuator`
      - `rejectOn`: array of interrupting block entity names
      - `rejectOnForcedClose`
*/
export default function ({ chars, continuator, rejectOn, rejectOnForcedClose  })
{
    let m = chars.split('').map(char => `${RegExp.escape(char)}+`).join('|');

    let open = [ `${s.sol}[^\\s].*${s.eol}`, 's' ];
    let setext = [ `^${s.mi}(?<type>${m})\\s*$`, 's' ];
    let listMark = `^${s.mi}(?:[-+*]|[aA1][.)])(?:${s.sot}|$)`;

    let pattern =
    {
        continuator,

        state: { rejectOn, rejectOnForcedClose },

        regex: { open, setext, listMark, blank: s.bl },
        
        action:
        {
            open(line) { return res.accept(this.getPruning(line).pruned.trimStart()); },
            
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

    return pattern;
}
