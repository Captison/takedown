import res from '../lib/action-response'
import s from '../lib/reparts'


let raw = [ 'pre', 'script', 'style', 'textarea' ];

let tags =
[
    'address', 'article', 'aside', 'base', 'basefont', 
    'blockquote', 'body', 'caption', 'center', 'col', 
    'colgroup', 'dd', 'details', 'dialog', 'dir', 
    'div', 'dl', 'dt', 'fieldset', 'figcaption', 
    'figure', 'footer', 'form', 'frame', 'frameset', 
    'h1', 'h2', 'h3', 'h4', 'h5', 
    'h6', 'head', 'header', 'hr', 'html', 
    'iframe', 'legend', 'li', 'link', 'main', 
    'menu', 'menuitem', 'nav', 'noframes', 'ol', 
    'optgroup', 'option', 'p', 'param', 'search', 
    'section', 'summary', 'table', 'tbody', 'td', 
    'tfoot', 'th', 'thead', 'title', 'tr', 
    'track', 'ul'
];

// html block conditions (open: close)
let blocks =
{
    // 1. raw data tags
    [`<(?:${raw.join('|')})(?:\\s|>|$)`]: `<\\/(?:${raw.join('|')})>`,
    // 2. comment block
    ['<!--']: '-->',
    // 3. processing instruction
    ['<\\?']: '\\?>',
    // 4. declaration
    ['<![a-zA-Z]']: '>',
    // 5. character data
    ['<!\\[CDATA\\[']: '\\]\\]>',
    // 6. html tags
    [`<\\/?(?:${tags.join('|')})(?:${s.sot}|\\/?>|$)`]: s.bl
};

let keys = Object.keys(blocks);
// re map of `blocks`
let remap = keys.reduce((m, k) => (m.set(new RegExp(`^${k}`), new RegExp(blocks[k])), m), new Map());


/*
    Html block (types 1-6).
*/
export default
{
    type: 'block', 
    order: 10,

    state:
    {
        rejectOnForcedClose: true
    },

    regex:
    {
        open: `${s.sol}(?:${keys.join('|')})`,
        prune: `^${s.mi}`,
        blank: s.bl
    },

    action:
    {
        open(line, state)
        {
            let { pruned } = this.getPruning(line);
            let undented = pruned.replace(state.pruneRe, '');

            for (let re of remap.keys())
            {
                if (re.test(undented))
                {
                    state.closeRe = remap.get(re);
                    // close on opening line if closing regex also matches
                    if (state.closeRe.test(pruned)) return res.consume(pruned);

                    return res.accept(pruned);
                }
            }
            // for safety, but this should not happen
            return res.abort();
        },

        next(line, state)
        {
            let { pruned } = this.getPruning(line);
            // consume only empty string when closing line is blank
            if (state.closeRe.test(pruned))
                return res.consume(state.blankRe.test(pruned) ? '' : pruned);
            
            return res.accept(pruned);
        }
    },

    compile: true
}
