import s from '#lib/reparts.js'


export default
{
    order: 10, 
    priority: 10,

    pattern: 'inline-atomic-segments',
    patternData:
    {
        segments:
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
        ]
    }
}
