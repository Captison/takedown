import defaults from './config/defaults'
import restrict from './config/restrict'
import structure from './config/structure'
import TakedownError from './error/TakedownError'
import parser from './parser/core'


let takedown = options =>
{
    let parse, changed = true;
    let td = makeConfig(defaults, options, () => changed = true);

    let getFm = source =>
    {
        let { fm } = td.config;

        if (typeof source !== 'string')
            throw new TakedownError('markdown content must be a string');

        if (fm.enabled && fm.capture.test(source))
            return source.match(fm.capture);
    }

    td.parse = source =>
    {
        let match = getFm(source);
        // update parse function if config changed since last call
        if (changed) (changed = false, parse = parser(td.config));

        let { fm } = td.config, doParse = parse;
        
        if (match)
        {
            // remove front-matter from source
            source = source.replace(match[0], '');

            if (fm.useConfig)
            {
                let data = fm.parser(match.groups.fm);
                // update parser with config from document (if available)
                if (data)
                {
                    if (fm.useConfig !== true) data = data[fm.useConfig];
                    let config = fm.varsOnly ? { vars: data } : data;
                    doParse = parser(makeConfig(td.config, config).config);
                }
            }
        }

        return doParse(source);
    }

    td.parseMeta = source =>
    {
        let fm = getFm(source)?.groups.fm;
        if (fm) return td.config.fm.parser(fm);
    }

    return td;
}

export default takedown;

let makeConfig = (one, two, notify) =>
{
    let td = restrict(structure, notify);

    td.config = one || {};
    td.config = two || {};

    return td;
}
