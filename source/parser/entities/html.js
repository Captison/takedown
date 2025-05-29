import res from '../lib/action-response.js'
import s from '#lib/reparts.js'


let html =
[
    // cdata
    '<!\\[CDATA\\[.*\\]\\]>',
    // closetag
    `<\\/${s.htn}\\s*>`,
    // comment
    '<!-{2,3}>', '<!--.*?-->',
    // declaration
    `<![a-zA-Z].*?>`,
    // instruction
    '<\\?.+?\\?>',
    // opentag
    `<${s.htn}(?:\\s+${s.han}(?:\\s*=\\s*(?:${s.hav}))?)*\\s*\\/?>`
];

export default
{
    type: 'inline', 
    order: 10, 
    priority: 10,
    
    regex:
    {
        open: [ `${s.ne}(?:${html.join('|')})`, 's' ]
    },

    action: part => res.consume(part),

    compile: content => content.join('')
}
