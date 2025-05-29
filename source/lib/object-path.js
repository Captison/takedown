
let digitRe = /^[0-9]+$/;
let split = path => Array.isArray(path) ? path : path.split('.')

let get = (object, path) =>
{
    let value = object;

    for (let name of split(path))
    {
        if (!Object.hasOwn(value, name))
            return void 0;
            
        value = value[name];
    }

    return value;
}

let set = (object, path, data) =>
{
    let value = object;
    let names = split(path);
    let last = names.pop();

    for (let name of names)
    {
        if (!Object.hasOwn(value, name))
            value[name] = digitRe.test(name) ? [] : {};
            
        value = value[name];
    }

    value[last] = data;
}

export default { get, set }
