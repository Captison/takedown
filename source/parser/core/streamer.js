import re from '#lib/re.js'
import toChunk from './chunker.js'


/**
    Converts markdown `source` into tokens based on `regexes`.

    All regexes in `array` are created/cloned to be global.

    @param { string } source
      Data to be parsed.
    @param { array } regexes
      Regex objects, strings, or parameter arrays.
*/
export default function (source, regexes)
{
    let { length } = source, lastIndex = 0, done = false;
    // prep all regexes making sure they are global
    let relist = regexes.map(re.g);
    // map to track regex tokens
    let tokens = new Map();
    // reverse source (for backward searches)
    let ecruos = [ ...source.replace(/\\([^\n])/g, '$1\\') ].reverse().join('');

    /*
        Iterable for source parsing.
    */
    let lexer =
    {
        [Symbol.iterator]() { return this; },

        // "EOF" indicator chunk
        eof: { done: false, value: toChunk.fromMatch() },

        next()
        {
            if (done) return { done };
            // send "EOF" if we are at end of source
            if (lastIndex === length) return (done = true, this.eof);

            let value = null;

            for (let regex of relist.values())
            {
                let token = tokens.get(regex);
                // pull from source on invalid token
                if (!token || token.index < lastIndex)
                {
                    regex.lastIndex = lastIndex;
                    token = regex.exec(source);
                }

                if (token)
                {
                    tokens.set(regex, token);
                    // set `value` when match is closer to search index
                    if (!value || token.index < value.index) value = token;
                    // use the first `value` that starts at search index
                    if (value.index === lastIndex) break;
                }
            }

            // no regex was able to tokenize at `lastIndex` so we need to grab 
            // uncaptured data as a token first
            if (!value || value.index > lastIndex)
            {
                let clip = source.slice(lastIndex, value?.index ?? length);
                // setup value as a search result
                value = [ clip ]; value.index = lastIndex;
            }
            // chunk `value` and create iterator return value
            let item = { done, value: toChunk.fromMatch(value) };
            // advance last index
            lastIndex += item.value.length;

            return item;
        },

        goto: index => index >= 0 && (done = false, lastIndex = index, tokens.clear())
    }

    /**
        Sets up source searching for a regex.

        When reverse is `true`, a reversed `source` string is used for 
        searching, and `start` is translated to be the same character in 
        that reversed source. However, `regex` is not translated and will 
        need to accont for the reversed disposition.

        The return value always reflects the forward-looking disposition.

        @param { RegExp } regex
          Regular expression for the search.
        @param { number } start
          Search will begin from this index (inclusive).
        @param { boolean } reverse
          Search string in reverse?
        @return { object }
          Functions for searching/capturing `source` chunks.
    */
    let use = (regex, start, reverse) =>
    {
        // correct index
        let x = idx => reverse ? length - idx : idx
        // clone regex and add g flag
        regex = re.g(regex);
        start ??= 0;

        let string = reverse ? ecruos : source;
        regex.lastIndex = x(start);

        let get = fn => (index, ...args) =>
        {
            // set last index if sepcified
            if (index || index === 0) regex.lastIndex = x(index);
            
            let data = { index: -1, slice: null };
            let result = regex.exec(string);

            if (result)
            {
                data.index = x(result.index);
                data.groups = result.groups; // not reversed
                data.slice = source.slice(data.index, data.index + result[0].length);
            }
  
            return fn(data, ...args);
        }

        /**
            Returns the chunk identified by the match.

            @return { String }
              Chunk found or `null`.
        */
        let clip = get(({ slice, index, groups }) => slice ? toChunk(slice, index,  groups) : null);

        /**
            Returns the index of the next match.

            @return { String }
              Chunk found or `null`.
        */
        let search = get(data => data.index);

        return { clip, search };
    }

    let funcs =
    {
        use,

        next: (re, start) => use(re, start, false),
        back: (re, start) => use(re, start, true),

        charAt: (idx, data) => toChunk(source.charAt(idx), idx, data),
        slice: (beg, end, data) => toChunk(source.slice(beg, end), beg, data)
    }

    return [ lexer, funcs ];
}
