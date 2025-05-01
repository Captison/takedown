import res from '../lib/action-response'
import listitem from './listitem'


/*
    List block.

    A list block is closed by:
    - different type of listitem
    - anything else that a listitem would reject

    Listitem blocks have higher priority than the list block.  This allows
    the list to reject any line is not an opening listitem, as the listitem
    itself can handle any subsequent lines.  When the listitem finally rejects,
    the list will pick up that line and either accept it as a listitem line or
    also reject.

    No data is returned with action responses as all content for list belongs
    to the internal listitems.
*/
export default
{
    type: 'block',
    order: 20,
    priority: listitem.priority + 1, 
    continuator: true,

    state:
    {
        rejectOn: [ 'divide', 'header', 'quotation' ],
        rejectOnForcedClose: true,
        loose: false
    },

    nestable: [ 'listitem' ],

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

    regex:
    {
        open: listitem.regex.open,
        blank: listitem.regex.blank,
        nonBlank: listitem.regex.nonBlank
    },

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
        let data = { name: 'ulist', chunks: content };

        if (state.listType.ord)
        {
            data.name = 'olist';
            data.start = parseInt(state.listType.ord);
        }

        let loose = state.loose || content.findIndex(item => item.state.loose) >= 0;
        // loosen things up if neither list nor items are tight
        if (loose) content.forEach(litem => litem.agent && litem.loosen());

        data.tight = !loose;

        return data;
    }
}
