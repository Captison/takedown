import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


/**
    @name inline-atomic-segments
    @type inline
    @outputs
      - `value`: captured text

    @description
      Segment is opened by one or more consecutive `char` characters and closed
      by the exact same number of `char` characters.

      An abstraction of CommonMark *raw html*.
      <https://spec.commonmark.org/0.31.2/#raw-html>

    @param { object } data
      - `segments`: array of regular expression strings that capture 
        uninterrupted text segments
*/
export default function ({ segments })
{
    let open = [ `${s.ne}(?:${segments.join('|')})`, 's' ];

    let pattern = 
    {
        regex: { open },

        action: part => res.consume(part),

        compile: content => content.join('')    
    }

    return pattern;
}
