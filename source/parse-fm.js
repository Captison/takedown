import TakedownError from './error/TakedownError.js'


/**
    Creates a parsing interface based on front-matter settings.

    @param { object } fm
      Front-matter config settings.
    @return { object }
      Front-matter parsing interface.
*/
export default function (fm)
{
    /**
        Extracts front-matter from a markdown document using `fm` settings.

        Returns front-matter truncated `source` and the match result from
        `fm.capture`.  If not `fm.enabled` or `fm.capture` does not match, `source`
        is not truncated and no result is returned.

        @return { array }
          Two-item array of adjusted `source` and fm match result.
    */
    let extract = source =>
    {
        if (typeof source !== 'string')
            throw new TakedownError('markdown content must be a string');

        let result;

        if (fm.enabled && fm.capture.test(source))
        {
            result = source.match(fm.capture);
            if (result) source = source.replace(result[0], '');
        }

        return [ source, result ];
    }

    /**
        Gets configuration parameters identified by `fm` from `matter`.

        @param { object } matter
          Parsed front-matter data.
        @return { object }
          Config parameters or `undefined` if not found/enabled.
    */
    let getConfig = matter =>
    {
        if (matter && fm.enabled && fm.useConfig)
        {
            let data = fm.useConfig === true ? matter : matter[fm.useConfig];
            return fm.varsOnly ? { vars: data } : data;
        }
    }

    let parse = source =>
    {
        let [ adjusted, result ] = extract(source);
        return [ adjusted, result ? fm.parser(result.groups.fm) : result ];
    }

    return { extract, getConfig, parse };
}
