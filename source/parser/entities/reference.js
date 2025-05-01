import res from '../lib/action-response'
import normalize from '../lib/normalize-label'


/*
    Link reference block.

    https://spec.commonmark.org/0.31.2/#link-reference-definitions
*/
export default
{
    type: 'block',
    order: 20,

    regex: s =>
    {
        let label = `\\[(?<text>${s.ll})\\]:`;
        let url = `(?<url>${s.ld})`;
        let title = `(?<title>${s.lt})`;

        let exprs =
        {
            open: [ `${s.mi}${label}${s.swole}(?=[^\\s])${url}${s.swole}(?:(?<=\\s)${title})?${s.sot}*${s.eol}`, 'ys' ],
            test: `${s.mi}\\[`,
            blank: s.bl,
            titleTrim: /^.(.*?).$/s,
            urlTrim: /^<(.*?)>$/,
        }

        return exprs;
    },

    open(line, state)
    {
        // quick test to see if line is somewhat legit
        if (!state.testRe.test(line)) return false;

        let [ pruned ] = this.getPruning(line);
        let clip = this.stream.use(state.openRe, pruned.index).clip();

        // make sure title has no blank lines
        if (!clip || state.blankRe.test(clip.groups.title)) return false;

        state.ref = clip.groups;
        return res.consume(null, clip.endex);
    },

    close(state)
    {
        let { text, title, url } = state.ref; 

        let label = normalize(text);
        // remove enclosures
        url = url.replace(state.urlTrimRe, '$1');
        title = title?.replace(state.titleTrimRe, '$1');
        // add reference link only if not already present
        this.document.refs ??= {};
        this.document.refs[label] ??= { url, title };

        return true;
    }
}
