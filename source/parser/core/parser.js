import iterate from './iterate'
import streamer from './streamer'


export default function ({ agentPool, madoe })
{   
    let inlineParser = ({ name, nestable }) =>
    {
        if (nestable?.length )
        {
            let entity = { name, type: 'inline', nestable };
            return source => parse(source, entity).model.chunks    
        }
    }

    let context = { document: {}, inlineParser, madoe };

    let agenter = context => 
    {
        let agent = (...args) => agentPool.get().initialize({ ...context, agent }, ...args);
        
        agent.repool = agentPool.renew;

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
