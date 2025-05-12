import createAgent from './agency/agent.js'
import respool from '../lib/resource-pool.js'
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
    let agentPool = respool(createAgent);

    return source =>
    {
        let parse = parser({ agentPool, madoe });

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
