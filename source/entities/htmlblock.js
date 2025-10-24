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
    Html block (types 1-6).
*/
export default
{
    order: 10,

    pattern: 'block-pair-enclosure',
    patternData:
    {
        pairs:
        [
            // 1. raw data tags
            [ `<(?:${raw.join('|')})(?:\\s|>|$)`, `<\\/(?:${raw.join('|')})>` ],
            // 2. comment block
            [ '<!--', '-->' ],
            // 3. processing instruction
            [ '<\\?', '\\?>' ],
            // 4. declaration
            [ '<![a-zA-Z]', '>' ],
            // 5. character data
            [ '<!\\[CDATA\\[', '\\]\\]>' ],
            // 6. html tags
            [ `<\\/?(?:${tags.join('|')})(?:${s.sot}|\\/?>|$)`, s.bl ],
        ],
        rejectOnForcedClose: true
    }
}
