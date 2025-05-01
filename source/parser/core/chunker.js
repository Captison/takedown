
/**
    Turns a match result into a string object with properties.
*/
let toChunk = (value, index, groups) => 
{
    let chunk = new String(value);

    chunk.index = index;
    chunk.endex = index + chunk.length;
    chunk.groups = groups;
    chunk.id = `chunk:${chunk.index}-${chunk.endex}`;
    // equality test
    chunk.is = str => value === str
    
    return chunk;
}

toChunk.fromMatch = res => toChunk(res?.[0] ?? '', res?.index ?? -1, res?.groups)

export default toChunk
