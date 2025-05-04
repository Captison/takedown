import defaults from './config/defaults'
import restrict from './config/restrict'
import structure from './config/structure'
import TakedownError from './error/TakedownError'
import parser from './parser/core'


let takedown = options =>
{
    let parse, changed = true;
    let td = makeConfig(defaults, options, () => changed = true);

    let handleFm = (source, fn) =>
    {
        if (typeof source !== 'string')
            throw new TakedownError('markdown content must be a string');
        
        let fmre = td.config.fmCapture;
        
        if (fmre?.test(source)) 
            return fn(source.match(fmre));
    }

    td.parse = source => 
    {
        // update parse function if config changed since last call
        if (changed) (changed = false, parse = parser(td.config));

        let doParse = parse;
        handleFm(source, match => 
        {
            if (td.config.useFmConfig)
            {
                let fm = td.config.fmParser(match.groups.fm)
                if (fm?.takedown) doParse = parser(makeConfig(td.config, fm.takedown).config)
            }

            source = source.replace(match[0], '');
        });

        return doParse(source);
    }

    td.parseMeta = source => handleFm(source, match => td.config.fmParser(match.groups.fm))

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
