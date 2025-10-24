import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name inline-char-enclosure
    @type inline
    @outputs
      - `chars`: opening character sequence
      - `value`: enclosed text

    @description
      Segment is opened by one or more consecutive `char` characters and closed
      by the exact same number of `char` characters.

      Based on CommonMark *code spans*.
      <https://spec.commonmark.org/0.31.2/#code-spans>

    @param { object } data
      - `char`: demarcating character (only 1st char in string used)
*/
export default function ({ char })
{
    let c = RegExp.escape(char[0]);

    let open = 
    [ 
        `${s.ne}(?<!${c})(?<chars>${c}+)(?!${c})(?<text>.+?)(?<!${c})\\k<chars>(?!${c})`, 
        's' 
    ]

    let pattern = 
    {
        regex: { open },

        action: part => res.consume(part),

        compile: (content, state) =>
        {
            let { chars, text } = content.join('').match(state.openRe).groups;
            return { chars, value: text, ticks: chars };
        }
    }

    return pattern;
}
