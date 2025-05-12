import { $validate } from './restrict.js'


let type =
{
    array: (value, name) =>
    {
        if (!Array.isArray(value))
            return `${name} must be an array`
    },
    boolean: (value, name) =>
    {
        if (typeof value !== 'boolean')
            return `${name} must be a boolean value`
    },
    function: (value, name) =>
    {
        if (typeof value !== 'function')
            return `${name} must be a function`;
    },
    functionOrStringArray: (value, name) =>
    {
        if (Array.isArray(value))
        {
            if (value.findIndex(v => typeof v !== 'string') >= 0)
                return `${name} array can only contain strings`;
        }
        else if (typeof value !== 'function')
        {
            return `${name} must be a function or an array`;
        }
    },
    functionOrObject: (value, name) =>
    {
        if (!(typeof value === 'function' || typeof value === 'object'))
            return `${name} must be a function or an object`;
    },
    number: (value, name) =>
    {
        if (typeof value !== 'number')
            return `${name} must be a number`;
    },
    positive: (value, name) =>
    {
        if (!(typeof value === 'number' && value > 0) || value === null)
            return `${name} must be a number greater than zero or null`
    },
    regex: (value, name) =>
    {
        if (!(value instanceof RegExp))
            return `${name} must be a regular expression`;
    },
    regexOrString: (value, name) =>
    {
        if (!(value instanceof RegExp || typeof value === 'string'))
            return `${name} must be a regular expression or string`;
    },
    string: (value, name) =>
    {
        if (typeof value !== 'string')
            return `${name} must be a string`;
    },
    stringArray: (value, name) =>
    {
        if (!Array.isArray(value))
            return `${name} must be an array`

        if (value.findIndex(v => typeof v !== 'string') >= 0)
            return `${name} array can only contain strings`
    }
}


let converts =
[
    'autolink',
    'code',
    'codeblock',
    'divide',
    'email',
    'emphasis',
    'fenceblock',
    'header',
    'html',
    'htmlblock',
    'image',
    'linebreak',
    'link',
    'listitem',
    'olist',
    'paragraph',
    'quotation',
    'root',
    'setext',
    'strong',
    'ulist',
]

export default
{
    config:
    {
        '{*}': (_, name) => `${name} is not a valid configuration property`,

        convert:
        {
            '{*}': (value, name) => 
            {
                let attr = name.split('.').pop();

                if (!converts.includes(attr))
                    return `${name} is an invalid entity conversion name`;

                let type = typeof value;

                if (!(type === 'string' || type === 'function' || value === null)) 
                    return `${name} spec must be a string, a function, or null`;
            }
        },

        convertTabsAfter: type.stringArray,

        delouse: 
        {
            '{*}': 
            {
                [$validate]: type.stringArray,

                '{*}': type.stringArray
            }
        },

        fm:
        {
            enabled: type.boolean,
            capture: type.regex,
            parser: type.function,
            useConfig: (value, name) =>
            {
                if (!(typeof value === 'boolean' || typeof value === 'string'))
                    return `${name} must be a boolean or string value`
            },
            varsOnly: type.boolean
        },

        interpolation:
        {
            variables: type.regexOrString,
            segments: type.regexOrString
        },

        nestable:
        {
            '{*}': type.stringArray,
        },

        tabSize: type.positive,

        vars: 
        {
            '{*}': () => {}
        }
    }
}
