import chars from '../data/common-chars.json' with { type: 'json' }
import htmle from '../data/html-entities.json' with { type: 'json' }
import * as entities from '../entities/index.js'
import s from '#lib/reparts.js'


export default
{    
    convert:
    {
        autolink: '<a href="{url}">{value}</a>',
        code: '<code>{value}</code>',
        codeblock: '<pre><code>{value}</code></pre>\n',
        divide: '<hr />\n',
        email: '<a href="mailto:{email}">{value}</a>',
        emphasis: '<em>{value}</em>',
        fenceblock: e =>
        {
            e.lang = e.info?.match(/^\s*([^\s]+).*$/s)?.[1];
            return '<pre><code{? class="language-{lang}"?}>{value}</code></pre>\n'
        },
        header: '<h{level}>{value}</h{level}>\n',
        html: '{value}',
        htmlblock: '{value}',
        image: e =>
        {
            e.alt = e.value.replace(/<[^>]+?(?:alt="(.*?)"[^>]+?>|>)/ig, '$1');
            return `<img src="{href}" alt="{alt}"{? title="{title}"?} />`;
        },
        linebreak: '<br />\n',
        link: '<a href="{href??}"{? title="{title}"?}>{value}</a>',
        listitem: e =>
        {
            e.nl = e.child.count && (!e.tight || e.child.first !== 'paragraph') ? '\n' : '';
            return '<li>{nl}{value}</li>\n';
        },
        olist: e => `<ol${e.start !== 1 ? ` start="${e.start}"` : ''}>\n{value}</ol>\n`,
        paragraph: ({ parent: p, index }) => 
            p.tight ? '{value}' + (p.child.count - 1 === index ? '' : '\n') : '<p>{value}</p>\n',
        quotation: '<blockquote>\n{value}</blockquote>\n',
        root: '{value}',
        setext: '<h{level}>{value}</h{level}>\n',
        strong: '<strong>{value}</strong>',
        ulist: '<ul>\n{value}</ul>\n'
    },
    
    convertTabsAfter: 
    [
        '^',
        // listitem 
        '[*+-]', '\\d+[.)]',
        // quotation
        '>',
    ],

    delousers:
    {
        ampersandToEnt: { search: [ `${s.ne}&(?!(amp|quot|gt|lt);)`, 'g' ], replace: '&amp;' },
        commonCharToEnt: { search: [ '(?<cap>[<>"])', 'g' ], replace: g => chars[g.cap] },
        unescapePunct: { search: [ `\\\\(?<cap>[${s.apc}])`, 'g' ], replace: '$<cap>' },
        namedEntToChar: 
        { 
            search: [ `${s.ne}(?<cap>&[a-zA-Z0-9]+?;)`, 'g' ], 
            replace: g => htmle[g.cap]?.characters || g.match 
        },
        decimalEntToChar: 
        { 
            search: [ `${s.ne}&#(?<cap>[0-9]{1,7});`, 'g' ], 
            replace: g => String.fromCharCode(g.cap) 
        },
        hexEntToChar: 
        {
            search: [ `${s.ne}&#x(?<cap>[a-f0-9]{1,4});`, 'gi' ], 
            replace: g => String.fromCharCode(`0x${g.cap}`) 
        },
        lineEndToSpace: { search: [ `[${s.le}]`, 'g' ], replace: ' ' },
        encodeUriChars: { search: [ '(?<cap>[^%\\w]+)', 'g' ], replace: g => encodeURI(g.cap) },
        trimEnd: { search: '\\s*\\n$', replace: '' },
        trimEncSpace: { search: [ '^ (?<cap>\\s*[^\\s].*) $' ], replace: '$<cap>' },
        trimAroundNewline: { search: [ '\\s*\\n\\s*', 'g' ], replace: '\n' },
        // combo-delousers
        common: [ 'htmlEntsToChars', 'unescapePunct', 'commonHtmlEnts' ],
        commonHtmlEnts: [ 'ampersandToEnt', 'commonCharToEnt' ],
        htmlEntsToChars: [ 'namedEntToChar', 'decimalEntToChar', 'hexEntToChar' ],
        uri: [ 'htmlEntsToChars', 'unescapePunct', 'encodeUriChars', 'commonHtmlEnts' ]
    },

    entities,

    fm:
    {
        enabled: false,
        capture: /^---\s*\n(?<fm>.*?)\n---\s*/s,
        parser: source => JSON.parse(source),
        useConfig: 'takedown',
        varsOnly: false
    },

    interpolation:
    {
        variables: /\{([\w.]+)(?:\?\?(.*?))?\}/g,
        segments: /\{\?(((?!\{\?).)+?)\?\}/g
    },

    onAction: null,
    
    onConvert: null,

    refs: {},

    tabSize: 4,

    vars: {}
}
