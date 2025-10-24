
import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-char-capture
    @type block
    @outputs
      - `level`: length of opening char sequence (1-6)
      - `value`: captured text

    @description
      A single line opened by one to six consecutive `char` characters,
      followed by a space or tab, followed by the captured content, and then
      optionally closed by a space or tab and any number of `char` characters.

      Based on CommonMark *atx headings*.
      <https://spec.commonmark.org/0.31.2/#atx-headings>

    @param { object } data
      - `char`: demarcating character (only 1st char in string used)
*/
export default function({ char })
{
    let c = RegExp.escape(char[0]);

    let open = `${s.sol}(?<chars>${c}{1,6})(?:${s.sot}+(?<text>(?!${c}+\\s*\\n).+?))?(?:${s.sot}+${c}*)?\\s*${s.eol}`

    let pattern = 
    {
        regex: { open },

        action(line) { return res.consume(this.getPruning(line)[0]); },

        compile(content, state)
        {
            let { chars, text = '' } = content.join('').match(state.openRe).groups;
            return { level: chars.length, chunks: text };
        }
    };

    return pattern;
}
