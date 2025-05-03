import createAgent from './agency/agent'
import res from '../lib/action-response'
import respool from '../lib/resource-pool'
import detabber from './detabber'
import entitor from './entitor'
import finalizer from './finalizer'
import parser from './parser'


let insecureRe = /&#x?0+;/gi;

export default function (config)
{
    let detab = detabber(config);
    let finalize = finalizer(config);
    let agentPool = respool(createAgent);

    let root = entitor(
    { 
        name: 'root', 
        type: 'block', 
        nestable: Object.keys(config.entities), 
        action: line => line.trim('') === '' ? res.censor() : res.accept(line), 
        compile: true 
    });        

    return source =>
    {
        let parse = parser({ agentPool, madoe: entitor });

        let content = source;
        // replace insecure character
        content = content.replace(insecureRe, '&#xfffd;');
        // replace structural tabs with spaces
        content = detab(content);
        // parse document
        content = parse(content, root);
        // render document
        content = finalize(content.model);
        
        return content;
    }
}
