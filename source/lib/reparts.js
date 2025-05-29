/*
    Regular Expression Parts List
    ---------------------------------------------------------------------------
    Common regular expression sequences used by this parser.

    Hashtag comments indicate definitions that can be found in the spec at
    https://spec.commonmark.org/0.31.2/.
*/

let s = 
{
    // #ascii-control-character
    get acc() { return '\\u0000-\\u001f\\u007f'; },
    // alpha numeric ranges
    get anr() { return 'a-zA-Z0-9'; },
    // #ascii-punctuation-character
    get apc() { return `!"\\\\'#$%&()*+,./:;<=>?@\\[\\]^_\`{|}~-`; },
    // #blank-line
    get bl() { return `(?<=^|\n)(?!$)${s.sot}*(?=\n|$)`; },
    // decimal html entities
    get dhe() { return `${s.ne}&#([0-9]{1,7});`; },
    // #delimiter-run (w/o escaping rule)
    get dr() { return `(?<dr>.)\\k<dr>*` },
    // #email-address
    get ea() { return `[${s.anr}.!#$%&'*+\\/=?^_\`{|}~-]+@[${s.anr}](?:[${s.anr}-]{0,61}[${s.anr}])?(?:\\.[${s.anr}](?:[${s.anr}-]{0,61}[${s.anr}])?)*`; },
    // end-of-line
    get eol() { return `(?:[${s.le}]|$)` },
    // #hard-line-breaks
    get hlb() { return '(?:  +|\\\\)\\n'; },
    // html #attribute-name
    get han() { return `[a-zA-Z_:][${s.anr}_.:-]*`; },
    // html #attribute-value
    get hav() { return `[^\\s"'<=>\`]+|"((?!\\\\").)*?"|'((?!\\\\').)*?'`; },
    // html #closing-tag
    get hct() { return `<\\/${s.htn}>`; },
    // hex html entities
    get hhe() { return `${s.ne}&#x([a-fA-F0-9]{1,4});`; },
    // html #open-tag
    get hot() { return `<${s.htn}(?:\\s+${s.han}(?:\\s*=\\s*(?:${s.hav}))?)*\\s*\\/?>`; },
    // html #tag-name
    get htn() { return `[a-zA-Z][${s.anr}-]*`; },
    // #indented-chunk
    get ic() { return '(?: {4}|\\t)'; },
    // #link-destination
    get ld() { return `${s.ne}<[^\\n<]*?${s.ne}>|(?=[^<])${nest.paren(`[^\\n\\u0020\\u0009${s.acc}]`)}`; },
    // #line-ending
    get le() { return '\\n\\u000a\\u000d'; },
    // #link-label (assumes bracket enclosure)
    get ll() { return `(?!\\s*\\])(?:(?!${s.ne}[\\[\\]]).){0,998}(?=${s.ne}\\])`; },
    // #link-title
    get lt() { return `"(?:(?!${s.ne}").)*"|'(?:(?!${s.ne}').)*'|\\(${nest.paren()}\\)`; },
    // maximum indentation
    get mi() { return ' {0,3}'; },
    // non-blank line
    get nbl() { return '(?<=^|\\n).*\\S.*(?=\\n|$)'; },
    // not escaped (eliminates `\` pairs)
    get ne() { return '(?<=(?<!\\\\)(?:\\\\\\\\)*)'; },
    get nesc() { return s.ne; },
    // named html entities
    get nhe() { return `${s.ne}&[a-z0-9]+?;`; },
    // opening atx header
    get oah() { return '#{1,6}'; },
    // opening fence block
    get ofb() { return `\`{3,}(?=[^\`]*${s.eol})|~{3,}`; },
    // opening list item
    get oli() { return '(?:[-+*]|(?:[a-z]{0,9}|[A-Z]{0,9}|[0-9]{0,9})[.)])(?=\\s)'; },
    // opening quote block
    get oqb() { return '>'; },
    // protocol #scheme
    get ps() { return `[a-zA-Z][${s.anr}.+-]{1,31}:`; },
    // start-of-line
    get sol() { return `(?:^|(?<=\\n))${s.mi}` },
    // space or tab
    get sot() { return '[\\u0020\\u0009]'; },
    // space with one (up to) line ending
    get swole() { return `${s.sot}*[${s.le}]?${s.sot}*`; },
    // #unicode-punctuation-character
    get upc() { return '\\p{P}|\\p{S}' },
    // #unicode-whitespace-character
    get uwsc() { return '\\p{Zs}|[\\u0009\\u000a\\u000c\\u000d]'; },
};


// Functions
// --------------------------------------------------
s.fn = {};

s.fn.flank =
{
    // #left-flanking-delimiter-run
    l: (c, quant = '') => 
    {
        let i = `(?<lfdr>${s.ne}${c}${quant})`;
        let one = `${i}(?=${c}*(?!${c})(?!${s.uwsc}|${s.upc}|$))`;
        let two = `(?<=(?:^|${s.uwsc}|${s.upc})(?<!${c})${c}*)${i}(?=${c}*(?!${c})(?:${s.upc}))`;
        return `${one}|${two}`;
    },
    // #right-flanking-delimiter-run
    r: (c, quant = '') => 
    {
        let i = `(?<rfdr>${s.ne}${c}${quant})`;
        let one = `(?<=(?<!^|${s.uwsc}|${s.upc})(?<!${c})${c}*)${i}`;
        let two = `(?<=(?:${s.upc})(?<!${c})${c}*)${i}(?=${c}*(?!${c})(?:${s.uwsc}|${s.upc}|$))`;
        return `${one}|${two}`;
    },
}

let nest = s.fn.nest = (cc, o, c) =>
{
    cc ??= '.', o ??= '\\(', c ??= '\\)';

    let run = [ [ `(?!${s.ne}[${o+c}])`, cc ], '*' ];
    // level 1
    let inner = [ s.ne, o, run, s.ne, c ];
    // level 2
    let outer = [ s.ne, o, [ run, inner, '?', run ], '*', s.ne, c ];
    // level 3
    let later = [ s.ne, o, [ run, outer, '?', run ], '*', s.ne, c ];
    // level 4 - non-enclosing
    let final = [ [ run, later, '?', run ], '*' ];

    let loop = array =>
    {
        let string = '';

        for (let item of array)
        {
            string += Array.isArray(item) ? `(?:${loop(item)})` : item;
        }

        return string;
    }

    return loop([ final ]);
}

nest.brack = chars => s.fn.nest(chars, '\\[', '\\]')
nest.paren = chars => s.fn.nest(chars, '\\(', '\\)')

export default s
