import respool from '#lib/resource-pool.js'
import actionLog from './core/action-log.js'
import createAgent from './agency/agent.js'
import detabber from './core/detabber.js'
import entity from './entity/index.js'
import finalizer from './core/finalizer.js'
import interpolator from './core/interpolator.js'
import parser from './core/parser.js'


let insecureRe = /&#x?0+;/gi;

export default function (config)
{
    let detab = detabber(config);
    let madoe = entity(config);
    let inter = interpolator(config);
    let finalize = finalizer(config, inter);
    let logger = actionLog(config);
    let agentPool = respool(() => createAgent(logger));

    return (source) =>
    {
        let document = { id: performance.now().toString(16).replace('.', ''), refs: {}, globalRefs: config.refs };

        let parse = parser({ document, agentPool, madoe });

        // replace insecure character
        source = source.replace(insecureRe, '&#xfffd;');
        // replace structural tabs with spaces
        source = detab(source);
        // parse document
        let target = parse(source, 'root');
        // render document
        target = finalize(target, document);
        
        return { source, doc: target, meta: document };
    }
}
