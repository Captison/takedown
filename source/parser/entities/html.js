import res from '../lib/action-response'


export default s =>
{
    let entity = { type: 'inline', order: 10, priority: 10 };

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
    
    entity.regex =
    {
        open: s => [ `${s.ne}(?:${html.join('|')})`, 's' ]
    }

    entity.action = part => res.consume(part)
    entity.compile = content => content.join('')

    return entity;
}
