import * as entities from '../parser/entities'


export default
{
    convert:
    {
        autolink: '<a href="{url}">{value}</a>',
        code: '<code>{value}</code>',
        codeblock: '{td.licnl}<pre><code>{value}</code></pre>\n',
        divide: '{td.licnl}<hr />\n',
        email: '<a href="mailto:{email}">{value}</a>',
        emphasis: '<em>{value}</em>',
        fenceblock: v => 
        { 
            v.class = v.info?.match(/^\s*([^\s]+).*$/s)?.[1];
            return `{td.licnl}<pre><code{? class="language-{class}"?}>{value}</code></pre>\n`;
        },
        html: '{value}',
        htmlblock: '{td.licnl}{value}',
        header: '{td.licnl}<h{level}>{value}</h{level}>\n',
        image: v =>
        {
            v.alt = v.value.replace(/<[^>]+?(?:alt="(.*?)"[^>]+?>|>)/ig, '$1');
            return `<img src="{url}" alt="{alt}"{? title="{title}"?} />`;
        },
        linebreak: '<br />\n',
        link: '<a href="{url}"{? title="{title}"?}>{value}</a>',
        listitem: `<li>{value}</li>\n`,
        olist: v =>
        {
            v.first = v.start === 1 ? null : v.start;
            return '{td.licnl}<ol{? start="{first}"?}>\n{value}</ol>\n';
        },
        paragraph: ({ parent: p, ...v }) => 
        {
            return p.tight ? v.value + (v.nindex < p.ncount - 1 ? '\n' : '') : '{td.licnl}<p>{value}</p>\n';
        },
        root: '{value}',
        quotation: '{td.licnl}<blockquote>\n{value}</blockquote>\n',
        setext: '{td.licnl}<h{level}>{value}</h{level}>\n',
        strong: '<strong>{value}</strong>',
        ulist: '{td.licnl}<ul>\n{value}</ul>\n'
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
            url: [ 'uri' ],
            title: [ 'common' ]
        },
        link:
        {
            value: [ 'common' ],
            url: [ 'uri' ],
            title: [ 'common' ]
        },
        paragraph: [ 'trimAroundNewline', 'common' ],
        quotation: [ 'trimEnd' ],
        setext: [ 'trimAroundNewline', 'common' ],
        strong: [ 'common' ],
    },

    interpolate:
    {
        vars: /\{([\w.]+)\}/g,
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

    vars:
    {
        td:
        {
            licnl: v => v.parent.name === 'listitem' && v.nindex === 0 ? '\n' : '', 
        },

        url: ''
    }
}
