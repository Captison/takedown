import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name block-char-divider
    @type block
    @outputs
      - `chars`: string of chars used to match

    @description
      A line of 3 or more of the same character (one of `chars`).

      Based on CommonMark *thematic breaks*.
      <https://spec.commonmark.org/0.31.2/#thematic-breaks>

    @param { object } data
      - `chars`: match characters (each character in string is used)
*/
export default function ({ chars })
{
    let mats = chars.split('').map(char => `(?:${RegExp.escape(char)}${s.sot}*){3,}`).join('|');

    let open = `${s.sol}(?<chars>${mats})\\s*${s.eol}`;

    let pattern =
    {
        regex: { open },

        action(line) { return res.consume(this.getPruning(line)[0]); },

        compile: (content, state) =>
        {
            let { chars } = content.join('').match(state.openRe).groups;
            return { chars, marks: chars };
        }
    }

    return pattern;
}
