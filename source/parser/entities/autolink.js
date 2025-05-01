import res from '../lib/action-response'


/*
    Autolink inline.
*/
export default
{
    type: 'inline',
    order: 10,
    priority: 10,

    regex: s =>
    ({
        open: `<${s.ps}`,
        full: `^<(?<uri>${s.ps}[^\\s${s.acc}<>]*)>$`,
        close: `[^\\s${s.acc}<>]*>`
    }),

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
        let { uri } = content.join('').match(state.fullRe).groups;
        return { url: uri, value: uri };
    }
}
