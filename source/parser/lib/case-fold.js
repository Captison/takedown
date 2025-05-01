import folding from '../data/case-folding.json' with { type: 'json' }


/*
    Performs a "full" (C + F) unicode case fold.

    The imported json file has removed T and S statuses from    
    https://www.unicode.org/Public/UNIDATA/CaseFolding.txt.
*/
export default function (string)
{
    let str = '', x = 0;

    while (x < string.length)
    {
        let code = string.codePointAt(x).toString(16).toUpperCase();
        // pad hex up to 4 chars
        if (code.length < 4) code = '0'.repeat(4 - code.length) + code;

        let chars = folding[code]?.mapping;
        // append `char` if no folding record
        if (chars) 
            str += String.fromCodePoint(...chars.map(c => parseInt(c, 16)));  
        else
            str += string.charAt(x);
  
        x ++;
    }

    return str;
}
