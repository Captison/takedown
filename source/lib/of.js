
/*
    Returns a better `typeof` value.

    This function is a compliment to `is`, and thus the return value will be 
    one of its function names.

    Note these changes to `typeof` return value:
    - "boolean" is renamed to "bool"
    - "function" is renamed to "func"
    - "undefined" is renamed to "undef"
    - "object" is renamed to
      - "null" for `null`
      - "array" for array values
      - "nonao" for non-array object values

    All other `typeof` values are returned as-is.

    @param { any } value
      The value to test.
    @return { string }
      Improved `typeof` value.
*/
export default function (value)
{
    let type = typeof value;

    switch (type)
    {
        // direct
        case 'bigint':   
        case 'number':   
        case 'string':   
        case 'symbol':   
            return type;
        
        // renamed
        case 'boolean': return 'bool';
        case 'function': return 'func';
        case 'undefined': return 'undef';

        // objects
        case 'object':
            return value === null ? 'null' : Array.isArray(value) ? 'array' : 'nonao'
    }
}
