import caseFold from './case-fold.js'


let space = /\s+/g;
/**
    Normalizes a label as per the CommonMark spec.

    @see {@link https://spec.commonmark.org/0.31.2/#link-label}
*/
export default function (string)
{
    string = string.trim();
    string = string.replace(space, ' ');
    // string = string.toLowerCase();
    string = caseFold(string);

    return string;
}
