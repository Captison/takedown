import createAgent from './agency/agent'
import iterate from './iterate'
import streamer from './streamer'


export default function ({ madoe })
{   
    let inlineParser = ({ name, nestable }) =>
    {
        let entity = { name, type: 'inline', nestable };
        return source => parse(source, entity).model.chunks
    }

    let context = { document: {}, inlineParser, madoe };

    // TODO: Pool agents instead of creating new ones?
    let agenter = context => 
    {
        let agent = (...args) => createAgent()({ ...context, agent }, ...args);
        return agent;
    }

    let parse = (source, entity) =>
    {
        let [ stream, streamFn ] = streamer(source, madoe[madoe(entity).type]);
        
        let get = agenter({ ...context, current: {}, stream, streamFn });
        // use `stream` (iterable) to parse `source` into `root` entity
        return iterate(get(entity), stream);
    }

    return parse;
}
