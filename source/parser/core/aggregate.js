
/**
    Merges contiguous uncompiled strings.

    Chunks are merged into a single string and processed with `parse`.
    Returned results are inserted back into the returned chunks array.

    @param { array } chunks
      Compiled and uncompiled chunk(s).
    @param { function } parse
      Compiles strings into chunks.
    @return { array }
      Compiled chunks.
*/
export default function (chunks, parse)
{
    let accume = [];
    parse ??= str => ([ str ])

    let aggregate = array => 
    {
        let string = accume.join('');
        if (string) array.push(...parse(string));
        
        accume = [];
        return array;
    }

    let reducer = (array, chunk) =>
    {
        (chunk.agent ? aggregate(array) : accume).push(chunk);
        return array;
    }

    return aggregate([].concat(chunks).reduce(reducer, []));
}
