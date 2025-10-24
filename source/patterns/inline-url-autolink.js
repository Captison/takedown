import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name inline-url-autolink
    @type inline
    @outputs
      - `url`: the URL
      - `value`: the URL

    @description
      A URL enclosed in angle brackets.

      Based on CommonMark *autolinks*.
      <https://spec.commonmark.org/0.31.2/#autolinks>
*/
export default function ()
{
    let open = `<${s.ps}`;
    let full = `^<(?<url>${s.ps}[^\\s${s.acc}<>]*)>$`;
    let close = `[^\\s${s.acc}<>]*>`;

    let pattern =
    {    
        regex: { open, full, close },

        action(part, state)
        {
            let { stream } = this;
            // find closing mark
            let clip = stream.use(state.closeRe, part.endex).clip();
            // capture everything up to end of `clip` if found
            if (clip?.index === part.endex) return res.consume(true, clip.endex);
            // abort otherwise
            return res.abort();
        },

        compile(content, state)
        {
            let { url } = content.join('').match(state.fullRe).groups;
            return { url, value: url };
        }
    }

    return pattern;
}
