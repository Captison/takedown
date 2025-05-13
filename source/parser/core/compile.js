
/**
    Invokes entity `compile` to get insertion variables for conversion to
    document structure.

    @return { object }
      Name of conversion and insertion variables.
*/
let compile = model => 
{
    let { chunks, document } = model;

    let data = model.compile(chunks, model.state);
    // `true` signals to do the default thing
    if (data === true) data = { chunks };
    // string becomes raw value
    else if (typeof data === 'string') data = { value: data };
    // pass an array as chunks
    else if (Array.isArray(data)) data = { chunks: data };
    // finally, we must have an object
    if (typeof data !== 'object') data = {};
    // set ids and ensure there is a conversion name
    data.id = model.id; data.docId = document.id; data.name ||= model.name;
    // no chunks or raw value present we can return
    if (Object.hasOwn(data, 'value') || !data.chunks) return data;
    // aggregate content and inline parse 
    return { ...data, chunks: aggro(data.chunks, model.inliner) }
}


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
let aggro = (chunks, parse) =>
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

export default compile
