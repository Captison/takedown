import defaults from './config/defaults.js'
import restrict from './config/restrict.js'
import structure from './config/structure.js'
import parser from './parser/core/index.js'
import fmParser from './parse-fm.js'


let takedown = options =>
{
    let get = config => 
    {
        let { parse, parseFm } = get;

        if (config)
        {
            config = makeIns(td.config, config).config;
            parse = parser(config);
            parseFm = fmParser(config.fm);
        }
        else if (get.changed ?? true) 
        {
            get.parse = parser(td.config);
            get.parseFm = fmParser(td.config.fm);
            get.changed = false;

            ({ parse, parseFm } = get);
        }

        return { parse, parseFm };
    }

    /*
        Takedown Instance
        ----------------------------------------
    */
    let td = makeIns(defaults, options, () => get.changed = true);

    td.clone = options => makeIns(td.config, options)

    td.parse = (source, config) =>
    {
        // create a new local configuration if necessary
        if (config) config = makeIns(td.config, config).config;

        let parseFm = fmParser((config || td.config).fm), matter;
        // update source and get front matter (if available)
        [ source, matter ] = parseFm.parse(source);

        let docConfig = parseFm.getConfig(matter);
        // update local config with front matter if necessary
        if (docConfig) config = makeIns(config || td.config, docConfig).config;

        // only if `config` exists do we need to customize `parse`
        let doParse = config ? parser(config) : get().parse;

        return { ...doParse(source), matter };
    }

    td.parseMeta = (source, fm) => 
    {
        let config = fm ? { fm } : fm;
        let [ matter ] = get(config).parseFm.parse(source).slice(1);
        return matter;
    }

    td.partition = (source, fm) =>
    {
        let config = fm ? { fm } : fm;
        let [ adjusted, result ] = get(config).parseFm.extract(source);
        return [ adjusted, result?.[0] ];
    }

    return td;
}

export default takedown;

let makeIns = (one, two, notify) =>
{
    let td = restrict(structure, notify);

    td.config = one || {};
    td.config = two || {};

    return td;
}
