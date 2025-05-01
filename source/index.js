import parser from './parser/core'
import defaults from './config/defaults'
import restrict from './config/restrict'
import structure from './config/structure'
import TakedownError from './error/TakedownError'


let takedown = options =>
{
    let td = makeConfig(defaults, options);

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
        let doParse = parser(td.config);

        handleFm(source, match => 
        {
            if (td.config.useFmConfig)
            {
                let fm = td.config.fmParser(match.groups.fm)
                if (fm?.takedown) 
                    doParse = parser(makeConfig(td.config, fm.takedown).config)
            }

            source = source.replace(match[0], '');
        });

        return doParse(source);
    }

    td.parseMeta = source => handleFm(source, match => td.config.fmParser(match.groups.fm))

    return td;
}

export default takedown;

let makeConfig = (one, two) =>
{
    let td = restrict(structure);

    td.config = one || {};
    td.config = two || {};

    return td;
}
