import re from '../lib/re'


let tabRe = /\t/;

/*
    Converts markdown block structure tabs to the proper tab stop in spaces.
*/
export default function ({ convertTabsAfter, tabSize })
{
    let marks = convertTabsAfter.join('|');
    let linesRe = re.gm(`^(?:(?:${marks})[\\t ]*)+`);

    return source => source.replace(linesRe, m => 
    {
        let index;

        while ((index = m.search(tabRe)) >= 0)
            m = m.replace(tabRe, ' '.repeat(tabSize - (index % tabSize)));

        return m;
    });
}
