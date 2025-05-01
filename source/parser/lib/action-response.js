
/*
    Entity action responses.
*/
let action = 
{
    abort: value => ({ ...base('abort'), value }),
    accept: (value, endex) => ({ ...base('accept'), value: value ?? '', endex }),
    block: (value, endex) => ({ ...base('block'), value: value ?? '', endex }),
    censor: () => ({ ...base('censor') }),
    consume: (value, endex) => ({ ...base('consume'), value: value ?? '', endex }),
    reject: () => ({ ...base('reject') }),
}

let base = name => ({ action: true, [name]: true, toString: () => name })

export default action
