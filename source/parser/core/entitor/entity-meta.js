import * as entities from '../../entities'
import mix from './mix'


let reducer = (array, name) =>
{
    let ent = mix(name);
    
    if (ent.type === 'inline')
    {
        let { delims = [], regex: { open } } = ent;
        // add open regex to delimiters (if existing)
        if (open) delims = [ open, ...delims ];
        
        delims.forEach(del => !array.includes(del) && array.push(del));
    }
    
    return array;
}
  
export let inlineDelimiters = Object.keys(entities).reduce(reducer, []);
