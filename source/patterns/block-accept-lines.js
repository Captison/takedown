import res from '#lib/action-response.js'


/**
    @name block-accept-lines
    @type block
    @outputs
      - `value`: captured text

    @description
      Accepts all non whitespace-only lines.
*/
export default function ()
{ 
    let pattern =
    {
        action: line => line.trim('') === '' ? res.censor() : res.accept(line), 

        compile: true 
    }

    return pattern;
}        
