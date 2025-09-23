

/**
    Returns `true` if `value` is not undefined nor null.

    Some notes:
    - use `is.nonao` to test for an object that is not an array
    - `is.object` and `is.nonao` will return false for `null`
    - `is.plain` tests constructor to be Object or non-existent
    - `is.empty` returns `false` if value is not an object

    
    @param { any } value
      Value to be checked.
    @return { boolean }
      Returns `false` if `value` is undefined or null.
*/
export default function is(value)
{
    return typeof value !== 'undefined' && value !== null;
}
// falsey values
is.blank = value => value === ''
is.false = value => value === false
is.null = value => value === null
is.nullish = value => !is(value)
is.undef = value => typeof value === 'undefined'
is.zero = value => value === 0
// exists as type
is.bigint = value => typeof value === 'bigint'
is.bool = value => typeof value === 'boolean'
is.func = value => typeof value === 'function'
is.number = value => typeof value === 'number'
is.object = value => typeof value === 'object' && value !== null
is.string = value => typeof value === 'string'
is.symbol = value => typeof value === 'symbol'
// is an array
is.array = value => Array.isArray(value)
// is a non-array object
is.nonao = value => is.object(value) && !is.array(value)
// is a "plain" object
is.plain = value => is(value) && (value.constructor === Object || !value.constructor)
// is empty object
is.empty = value => is.object(value) && Object.keys(value).length === 0
// is a serializable value
is.serial = value => is.object(value) || is.string(value) || is.number(value) || is.bool(value) || is.null(value)
