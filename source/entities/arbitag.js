import s from '#lib/reparts.js'


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

/*
    Html block (type 7).
*/
export default
{
    name: 'htmlblock',

    order: 11,

    pattern: 'block-pair-enclosure',
    patternData:
    {
        pairs:
        [
            // 7. custom tags
            [ `${s.sol}(?=<[^\\n]+?>)(?:${s.hot}|${s.hct})${s.sot}*${s.eol}`, s.bl ]
        ],
        rejectOnForcedClose: true
    }
}
