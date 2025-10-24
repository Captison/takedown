import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-atomic-fence
    @type block
    @outputs
      - `fence`: opening fence characters
      - `info`: info-strng for the block
      - `value`: captured text

    @description
      If a character apears in both `chars` and `restrictChars`, that 
      character cannot be repeated in the info-string.

      An abstraction of CommonMark *fenced code blocks*.
      <https://spec.commonmark.org/0.31.2/#fenced-code-blocks>

    @param { object } data
      - `chars`: fence characters (each character in string is used)
      - `rejectOnForcedClose`
      - `restrictChars`: restricted fence characters
*/
export default function ({ chars, restrictChars, rejectOnForcedClose })
{
    restrictChars ||= '';

    let mats = chars.split('').map(char => 
    {
        let c = RegExp.escape(char);
        let rep = `${c}{3,}`;
        if (restrictChars.indexOf(char) >= 0) rep += `(?=[^${c}]*${s.eol})`;
        return rep;
    });

    let open = `(?<indent>${s.sol})(?<fence>${mats.join('|')})(?<info>.*)${s.eol}`;
    let indent = `^${s.mi}`;

    let cut = ct => line => line.replace(new RegExp(`^ {0,${ct}}`), '')

    let pattern =
    {
        state: { rejectOnForcedClose },

        regex: { open, indent },

        action:
        {
            open(line, state)
            {
                let [ pruned ] = this.getPruning(line);

                let { indent, fence } = pruned.match(state.openRe).groups;
                // block is closed with same or greater fence length
                state.closeRe = new RegExp(`^${fence[0]}{${fence.length},}\\s*$`);
                state.unIndent = cut(indent.length);
                // keep the unindented line
                return res.accept(state.unIndent(pruned));
            },

            next(line, state)
            {
                let { pruned } = this.getPruning(line); 
                // consume on closing marks (of any indentation)
                if (state.closeRe.test(pruned.replace(state.indentRe, ''))) 
                    return res.consume();
                // accept any other line removing opening indentation
                return res.accept(state.unIndent(pruned));
            }
        },

        compile: (content, state) =>
        {
            let { fence, info } = content[0].match(state.openRe).groups;
            let value = content.slice(1).join('');

            return { fence, info, value }; 
        }
    }

    return pattern;
}
