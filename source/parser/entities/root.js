import res from '../lib/action-response'


/*
    Root document block.
*/
export default
{ 
    type: 'block', 

    action: line => line.trim('') === '' ? res.censor() : res.accept(line), 

    compile: true 
}        
