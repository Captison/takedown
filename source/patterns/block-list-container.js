import res from '#lib/action-response.js'
import s from '#lib/reparts.js'


let mark = '(?<mark>[-+*.)])';
let ord = '(?<ord>[0-9]{0,9}(?=\\.|\\)))';

/**
    @name block-list-container
    @type block
    @outputs
      - `start`: starting index for ordered list
      - `tight`: paragraph container suppression indicator
      - `value`: captured text

    @description
      Listitem blocks should have higher priority than their list container.  
      This allows the container to reject any line is not opening a listitem, 
      as the listitem itself can handle any subsequent lines.  When the 
      listitem finally rejects, the container will pick up that line and either 
      accept it as a new listitem or also reject.

      No data is returned with action responses as all content for list belongs
      to the internal listitems.

      Based on CommonMark *lists*.
      <https://spec.commonmark.org/0.31.2/#lists>

    @param { object } data
      - `continuator`
      - `ordered`: converter name for ordered list
      - `rejectOn`: array of interrupting block entity names
      - `rejectOnForcedClose`
      - `unordered`: converter name for unordered list
*/
export default function ({ continuator, ordered, unordered, rejectOn, rejectOnForcedClose })
{
    let open = [ `(?<ind>${s.sol})(?<bull>${ord}?${mark})(?<pre> *)(?<text>(?<=${s.sot}).*)?${s.eol}`, 'si' ];

    let pattern =
    {
        continuator,

        state: { rejectOn, rejectOnForcedClose, loose: false },

        setType(ord, mark, state)
        {
            let re = new RegExp((ord ? `\\d{0,9}` : '') + `\\${mark}`);        
            state.listType = { ord, mark, re };
        },

        contentAhead(line, state)
        {
            // find next non-blank line
            let clipped = this.stream.use(state.nonBlankRe, line.endex).clip();

            if (clipped)
            {
                let [ pruned ] = this.getPruning(clipped);
                return pruned !== null && this.isMatched(pruned, state);
            }

            return false;
        },

        isMatched(pruned, state)
        {
            if (state.openRe.test(pruned))
            {
                // this line must be of the same type
                let { ord, mark } = pruned.match(state.openRe).groups;
                return state.listType.re.test(ord + mark);
            }

            return false;
        },

        regex: { open, blank: s.bl, nonBlank: [ s.nbl, 'm' ] },

        action:
        {
            open(line, state)
            {
                let [ pruned ] = this.getPruning(line);

                let { ord, mark } = pruned.match(state.openRe).groups;
                // store list type information
                this.setType(ord, mark, state);
                // all content belongs to listitems
                return res.accept();
            },

            next(line, state)
            {
                let [ pruned, parepruned ] = this.getPruning(line);

                // reject on other blocks
                if (this.opens(parepruned, ...state.rejectOn)) return res.reject();
                // accept on list item of the same type
                if (this.isMatched(pruned, state)) return res.accept();
                // accept on blank line if more content ahead
                if (state.blankRe.test(pruned)) 
                {
                    if (this.contentAhead(line, state)) 
                    {
                        state.loose = true;
                        return res.accept();
                    }
                    return res.reject();
                }
                // reject by default as listitem has priority
                return res.reject();
            }
        },

        compile(content, state)
        {
            let data = { name: unordered, chunks: content };

            if (state.listType.ord)
            {
                data.name = ordered;
                data.start = parseInt(state.listType.ord);
            }

            let loose = state.loose || content.findIndex(item => item.state.loose) >= 0;
            // loosen things up if neither list nor items are tight
            if (loose) content.forEach(litem => litem.agent && litem.loosen());

            data.tight = !loose;

            return data;
        }
    }

    return pattern;
}
