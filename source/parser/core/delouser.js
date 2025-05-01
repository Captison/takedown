import htmle from '../data/html-entities.json' with { type: 'json' }
import re from '../lib/re'


/*
    Character/Data searchers
    ---------------------------------------------------------------------------
*/
let search = {};
// search regex payloads must be in first capture group
search.ampersand = re.g(s => `${s.ne}&(?!(amp|quot|gt|lt);)`);
search.commonChar = re.g('([<>"])');
search.escaped = re.g(s => `\\\\([${s.apc}])` );
search.namedEnt = re.g(s => `${s.ne}(&[a-zA-Z0-9]+?;)`);
search.decEnt = re.g(s => `${s.ne}&#([0-9]{1,7});`);
search.hexEnt = re.gi(s => `${s.ne}&#x([a-f0-9]{1,4});`);
search.lineEnd = re.g(s => `[${s.le}]`);
search.whiteNewline = re.g('\\s*\\n\\s*');
search.uriChar = re.g('([^%\\w]+)');
search.whiteEnd = re('\\s*\\n$');
search.whiteSpecial = re('^ (\\s*[^\\s].*) $');


/*
    Character/Data replacers
    ---------------------------------------------------------------------------
*/
let replace = {};
// common html entity map
let chars = { "\"": "&quot;", "<": "&lt;", ">": "&gt;" };
// replacers will use first capture group (if necessary)
let one = fn => (...a) => fn(a[1])
replace.commonEnt = one(m => chars[m] || m);
replace.decChar = one(m => String.fromCharCode(m));
replace.encodeUri = one(m => encodeURI(m))
replace.hexChar = one(m => String.fromCharCode(`0x${m}`));
replace.group = one(m => m);
replace.namedChar = one(m => htmle[m]?.characters || m);


let delousers =
{
    common: str =>
    {
        str = delousers.htmlEntsToChars(str);
        str = delousers.unescapePunct(str);
        str = delousers.commonHtmlEnts(str);
        return str;
    },

    commonHtmlEnts: str => 
    {
        str = str.replace(search.ampersand, '&amp;');
        str = str.replace(search.commonChar, replace.commonEnt);
        return str;
    },

    encodeUriChars: str => str.replace(search.uriChar, replace.encodeUri),

    htmlEntsToChars: str => 
    {
        str = str.replace(search.namedEnt, replace.namedChar);
        str = str.replace(search.decEnt, replace.decChar);
        str = str.replace(search.hexEnt, replace.hexChar);
        return str;
    },

    lineEndToSpace: str => str.replace(search.lineEnd, ' '),

    trimAroundNewline: str => str.replace(search.whiteNewline, '\n'),

    trimEncSpace: str => str.replace(search.whiteSpecial, replace.group),

    trimEnd: str => str.replace(search.whiteEnd, ''),

    unescapePunct: str => str.replace(search.escaped, replace.group)
        .replaceAll('\\', '\u005C'),

    uri: str =>
    {
        str = delousers.htmlEntsToChars(str);  
        str = delousers.unescapePunct(str);
        str = delousers.encodeUriChars(str);
        str = delousers.commonHtmlEnts(str);  
        return str;
    }
}

export default function (config)
{
    let { delouse } = config;

    return (data) =>
    {
        let { name, ...obj } = { ...data };
        let spec = delouse[name];

        if (spec)
        {
          // top-level delousing config applies to `value`
          if (Array.isArray(spec)) spec = { value: spec };

          Object.keys(obj).forEach(key =>
          {
              if (Array.isArray(spec[key]))
                  obj[key] = spec[key].reduce((s, n) => delousers[n](s), obj[key]);
          });
        }

        return { name, ...obj };
    }
}
