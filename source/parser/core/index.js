import respool from '#lib/resource-pool.js'
import createAgent from './agency/agent.js'
import detabber from './detabber.js'
import entitor from './entitor/index.js'
import finalizer from './finalizer.js'
import interpolator from './interpolator.js'
import parser from './parser.js'


let insecureRe = /&#x?0+;/gi;

export default function (config)
{
    let detab = detabber(config);
    let madoe = entitor(config);
    let inter = interpolator(config);
    let finalize = finalizer(config, inter);
    let agentPool = respool(() => createAgent(config));

    return (source) =>
    {
        let document = { id: performance.now().toString(16).replace('.', ''), refs: {} };

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
