import res from '../lib/action-response'


let mark = '(?<mark>[-+*.)])';
let ord = '(?<ord>[0-9]{0,9}(?=\\.|\\)))';

/*
    List item block.

    A list item can be interrupted by:
    - thematic break
    - another list item at same level
    - blank line(s) followed by an insufficiently indented line
*/
export default
{
    type: 'block',
    priority: 30,
    uproot: true,

    contentAhead(line, state)
    {
        let clipped, { clip } = this.stream.use(state.nonBlankRe, line.endex);

        while (clipped = clip())
        {
            let { pruned, 0: mypruned } = this.getPruning(clipped);
            // when `pruned` is not blank this line is either going to end the 
            // list item or be included in it if properly indented
            if (state.nonBlankRe.test(pruned)) return mypruned !== null;
        }

        return false;
    },

    // called by parent list
    loosen() { this.state.loose = true; },

    state:
    {
        rejectOn: [ 'divide', 'header', 'list', 'quotation' ],
        rejectOnForcedClose: true,
        loose: false
    },

    regex:
    {
        open: s => [ `(?<ind>${s.sol})(?<bull>${ord}?${mark})(?<pre> *)(?<text>(?<=${s.sot}).*)?${s.eol}`, 'si' ],
        prune: s => `${s.mi}${ord}?${mark}${s.sot}?`,
        blank: s => s.bl,
        nonBlank: s => [ s.nbl, 'm' ]
    },

    prune(line, state)
    {
        let { stream } = this;
        // try secondary regex first
        let clip = this.stream.use(state.prune2Re, line.index).clip();
        // return end slice if we have found properly indented content
        if (clip?.index === line.index) return stream.slice(clip.endex, line.endex);
        // must be on the right opening line before trying opening regex
        if (state.openId && line.id !== state.openId) return null;
        // now safe to try to prune with opening regex
        clip = stream.use(state.pruneRe, line.index).clip();
        // return end slice if we have found opening markings
        if (clip?.index === line.index) return stream.slice(clip.endex, line.endex);
        // we cannot prune this line
        return null;
    },

    action:
    {
        open(line, state)
        {
            let { 1: parepruned } = this.getPruning(line);

            let { ind, bull, pre, text } = parepruned.match(state.openRe).groups;
            // determine indent size for subsequent listitem lines
            let indent = (ind?.length || 0) + bull.length;

            state.blankOpen = !text || state.blankRe.test(text);
            // a blank opener line cannot change indent requirement
            indent += !state.blankOpen && pre?.length <= 4 ? pre.length : 1;

            state.prune2Re = new RegExp(` {${indent}}`);
            state.openId = parepruned.id;

            return res.accept(!text || state.blankOpen ? '' : text);
        },

        next(line, state)
        {
            let { pruned, 0: mypruned } = this.getPruning(line);

            if (state.blankRe.test(pruned)) 
            {
                // reject on second opening blank line
                if (state.blankOpen) return res.reject();
                // reject when no valid content appears ahead
                if (!this.contentAhead(line, state)) return res.reject();
                // listitem now considered loose with accepted blank line
                state.loose = true;
                return res.accept();
            }
            // accept anything that is sufficiently indented
            if (mypruned !== null) return res.accept(pruned);
            // reject when current child block is not a continuator
            if (!state.blankOpen && !this.current.model.continuator) return res.reject();
            // reject on next listitem
            if (this.open(line)) return res.reject();
            // reject on insufficiently indented blocks
            if (this.opens(line, ...state.rejectOn)) return res.reject();
            // a blank open no longer matters
            delete state.blankOpen;

            return res.accept(pruned);
        }
    },

    compile(content, { loose })
    {    
        return { tight: !loose, chunks: content };
    }
}
