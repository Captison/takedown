import * as entities from '../parser/entities'


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
        fenceblock: v =>
        {
            v.lang = v.info?.match(/^\s*([^\s]+).*$/s)?.[1];
            return '<pre><code{? class="language-{lang}"?}>{value}</code></pre>\n'
        },
        header: '<h{level}>{value}</h{level}>\n',
        html: '{value}',
        htmlblock: '{value}',
        image: v =>
        {
            v.alt = v.value.replace(/<[^>]+?(?:alt="(.*?)"[^>]+?>|>)/ig, '$1');
            return `<img src="{href}" alt="{alt}"{? title="{title}"?} />`;
        },
        linebreak: '<br />\n',
        link: '<a href="{href??}"{? title="{title}"?}>{value}</a>',
        listitem: v =>
        {
            v.nl = v.child.count && (!v.tight || v.child.first !== 'paragraph') ? '\n' : '';
            return '<li>{nl}{value}</li>\n';
        },
        olist: v => `<ol${v.start !== 1 ? ` start="${v.start}"` : ''}>\n{value}</ol>\n`,
        paragraph: ({ parent: p, index }) => 
            p.tight ? '{value}' + (p.child.count - 1 === index ? '' : '\n') : '<p>{value}</p>\n',
        root: '{value}',
        quotation: '<blockquote>\n{value}</blockquote>\n',
        setext: '<h{level}>{value}</h{level}>\n',
        strong: '<strong>{value}</strong>',
        ulist: '<ul>\n{value}</ul>\n'
    },
    
    entities,

    delouse:
    {
        autolink:
        {
            value: [ 'htmlEntsToChars', 'commonHtmlEnts' ],
            url: [ 'htmlEntsToChars', 'encodeUriChars', 'commonHtmlEnts' ]
        },
        code: [ 'lineEndToSpace', 'trimEncSpace', 'commonHtmlEnts' ],
        codeblock: [ 'commonHtmlEnts' ],
        fenceblock:
        {
            value: [ 'commonHtmlEnts' ],
            info: [ 'common' ]
        },
        email:
        {
            value: [ 'commonHtmlEnts' ],
            email: [ 'commonHtmlEnts' ]
        },
        emphasis: [ 'common' ],
        header: [ 'common' ],
        image:
        {
            value: [ 'common' ],
            href: [ 'uri' ],
            title: [ 'common' ]
        },
        link:
        {
            value: [ 'common' ],
            href: [ 'uri' ],
            title: [ 'common' ]
        },
        paragraph: [ 'trimAroundNewline', 'common' ],
        quotation: [ 'trimEnd' ],
        setext: [ 'trimAroundNewline', 'common' ],
        strong: [ 'common' ],
    },

    interpolate:
    {
        vars: /\{([\w.]+)(?:\?\?(.*?))?\}/g,
        sections: /\{\?(((?!\{\?).)+?)\?\}/g
    },

    fmCapture: /^---\s*\n(?<fm>.*?)\n---\s*/s,
    fmParser: source => JSON.parse(source),

    convertTabsAfter: 
    [
        '^',
        // listitem 
        '[*+-]', '\\d+[.)]',
        // quotation
        '>',
    ],

    tabSize: 4,

    useFmConfig: false,

    vars: {}
}
