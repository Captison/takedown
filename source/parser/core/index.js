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

    return source =>
    {
        let id = performance.now().toString(16);
        let parse = parser({ id, agentPool, madoe });

        let content = source;
        // replace insecure character
        content = content.replace(insecureRe, '&#xfffd;');
        // replace structural tabs with spaces
        content = detab(content);
        // parse document
        content = parse(content, 'root');
        // render document
        content = finalize(content.model);
        
        return content;
    }
}
