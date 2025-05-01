import { $validate } from './restrict'


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
        '*': (_, name) => `${name} is not a valid configuration property`,

        convert:
        {
            '*': (value, name) => 
            {
                let attr = name.split('.').pop();

                if (!converts.includes(attr))
                    return `${name} is an invalid entity conversion name`;

                let type = typeof value;

                if (!(type === 'string' || type === 'function' || type === null)) 
                    return `${name} spec must be a string or a function`;
            }
        },

        convertTabsAfter: type.stringArray,

        delouse: 
        {
            '*': 
            {
                [$validate]: type.stringArray,

                '*': type.stringArray
            }
        },

        entities: {},

        fmCapture: (value, name) =>
        {
            if (!(value instanceof RegExp || value === null))
                return `${name} must be a regular expression`;
        },

        fmParser: (value, name) =>
        {
            if (typeof value !== 'function')
                return `${name} must be a function`;
        },

        interpolate:
        {
            vars: type.regexOrString,
            sections: type.regexOrString
        },

        useFmConfig: type.boolean,

        tabSize: type.positive,

        vars: 
        {
            '*': () => {}
        }
    }
}

export let entity =
{
    '*': (_, name) => `${name} is not a valid entity configuration property`,

    abortOnEmpty: type.boolean,

    action: (value, name) =>
    {
        if (!(typeof value === 'object' || typeof value === 'function'))
            return `${name} must be a function or object`
    },

    close: type.function,

    compile: (value, name) =>
    {
        let type = typeof value;

        if (type === 'function') return;
        if (type === 'object') return;
        if (type === 'string') return;
        if (type === 'undefined') return;
        if (value === true) return;

        return `${name} must be a function, object, string, \`undefined\`, or \`true\``;
    },

    continuator: type.boolean,

    delims: (value, name) =>
    {
        let isArray = Array.isArray(value);

        if (!(isArray || typeof value === 'function'))
            return `${name} must be a function or an array`

        if (isArray && value.findIndex(v => !(typeof v === 'string' || typeof v === 'function')) >= 0)
            return `${name} array can only contain strings`
    },

    nestable: type.stringArray,

    order: type.positive,

    priority: type.positive,

    regex: type.functionOrObject,

    removeSameAncestor: type.boolean,
    
    state: {},

    type: (value, name) => 
    {
        if (value !== 'block' && value !== 'inline')
            return `${name} can only be 'block' or 'inline'`
    },

    uproot: type.boolean
}
