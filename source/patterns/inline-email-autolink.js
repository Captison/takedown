import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name inline-email-autolink
    @type inline
    @outputs
      - `email`: the email address
      - `value`: the email address

    @description
      An email address enclosed in angle brackets.

      Based on CommonMark *autolinks*.
      <https://spec.commonmark.org/0.31.2/#autolinks>
*/
export default function ()
{
    let open = `<(?<email>${s.ea})>`;

    let pattern =
    {
        regex: { open },

        action: part => res.consume(part),

        compile(content, state)
        {
            let { email } = content.join('').match(state.openRe).groups;
            return { email, value: email };
        }
    }

    return pattern;
}
