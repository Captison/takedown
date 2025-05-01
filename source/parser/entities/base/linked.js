import res from '../../lib/action-response'
import normalize from '../../lib/normalize-label'


/*
    Base for link and image inlines.
*/
export default ({ fn, ...s }) =>
({
    type: 'inline',
    order: 20,
    priority: 20,

    delims:
    [
        `\\]`,
        `(?<=${s.ne}\\])\\(${s.swole}`,
        `(?<=${s.ne}\\]\\(.*?)${s.swole}\\)`,
    ],
    
    nestable: 
    [ 
        'autolink', 
        'code', 
        'email', 
        'emphasis', 
        'html', 
        'image', 
        'link',
    ],

    inlineClose(part, state)
    {
        return this.stream.use(state.closeInlineRe, part.endex).clip();
    },

    refClose(part, state)
    {
        return this.stream.use(state.closeRe, part.endex).clip();
    },

    setRef(label, state)
    {
        let ref = this.document.refs?.[normalize(label || '')];
        if (ref)
        {
            state.url = ref.url;
            state.title = ref.title;    
            return true;
        }
        return false;
    },

    state:
    {
        rejectOnForcedClose: true
    },

    regex:
    { 
        textBal: fn.nest.brack(),
        linkOpen: `^\\(${s.swole}`,
        refOpen: `^\\[`,
        titleTrim: /^[("'](.*?)['")]$/,
        urlTrim: /^<(.*?)>$/,
        // stickies
        url: [ s.ld, 'y' ],
        ref: [ s.ll, 'y' ],
        space: [ s.swole, 'y' ],
        title: [ s.lt, 'ys' ],
        closeInline: [ `${s.swole}${s.ne}\\)`, 'y' ],
        close: [ `\\]`, 'y' ],
    },

    action(part, state)
    {
        if (!state.linkTextDone)
        {
            if (!state.isOpen)
            {
                state.isOpen = true;
                return res.block();
            } 

            // end link text
            if (part.is(']'))
            {
                // ok to assume these brackets here
                let text = `[${this.content}]`;
                // if brackets are now balanced we are done
                if (text.match(state.textBalRe)?.[0] === text) 
                {
                    state.linkTextDone = true;
                    // no block here in case internal image/link needs to close
                    return res.accept();
                }
            }

            return res.accept(part);
        }    

        let closer, { stream } = this;

        // next part could be a '(' for inline link
        if (state.linkOpenRe.test(part))
        {
            // starting url as string object avoids looking for ref in `close`
            state.url = new String('');
            // check for immediate close; no link is ok
            if (stream.charAt(part.endex)?.is(')')) 
            {
                state.finish = true;
                return res.consume(null, part.endex + 1);
            }
            // look for a url ahead
            state.url = stream.use(state.urlRe, part.endex).clip();
            // reject here if we don't have a valid url
            if (!state.url) return res.reject();
            // check again for close here
            if (closer = this.inlineClose(state.url, state)) 
            {
                state.finish = true;
                return res.consume(null, closer.endex);
            }
            // assume next segment is spacing since we didn't close above
            let spacer = stream.use(state.spaceRe, state.url.endex).clip();
            // reject here if we don't have a spacer
            if (!spacer) return res.reject();
            // and now look for title
            state.title = stream.use(state.titleRe, spacer.endex).clip();
            // reject here if we don't have a valid title
            if (!state.title) return res.reject();
            // we should definitely have a close here
            if (closer = this.inlineClose(state.title, state)) 
            {
                state.finish = true;
                return res.consume(null, closer.endex);
            }
            // something has not gone right, reject
            return res.reject();
        }

        // or it could be a `[` for reference link
        if (state.refOpenRe.test(part))
        {
            // check for immediate close; no ref is ok
            if (stream.charAt(part.endex)?.is(']')) return res.consume(null, part.endex + 1);
            // look for a ref ahead
            let ref = stream.use(state.refRe, part.endex).clip();
            // reject if we don't have a valid ref
            if (!this.setRef(ref, state)) return res.abort();
            // we should get properly closed now
            if (closer = this.refClose(ref, state)) 
            {
                state.finish = true;
                return res.consume(null, closer.endex);
            }
            // something has not gone right, reject
            return res.reject();      
        }               
        
        // or maybe we already have a shortcut link?
        return res.reject();
    },

    close(state)
    {
        // not even link text, abort
        if (!state.linkTextDone) return false;
        // abort on unfinished details and no ref identified by text
        if (!state.finish) return this.setRef(this.content, state);

        return true;
    },

    compile(content, state)
    {
        let { name, url, title } = state, data = { chunks: content };

        data.name = name;
        // unescape and remove enclosures
        if (url) data.href = url.replace(state.urlTrimRe, '$1');
        if (title) data.title = title.replace(state.titleTrimRe, '$1');

        return data;
    }
})
