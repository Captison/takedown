import res from '../lib/action-response.js'
import s from '#lib/reparts.js'


let isRunSynced = (one, two) =>
{
    // delimiter run sync is when:
    // sum of lengths of open and close not a multiple of 3, or
    if ((one.length + two.length) % 3 !== 0) return true;
    // both open and close lengths are a multiple of 3
    return (one.length % 3 === 0) && (two.length % 3 === 0);
}

/*
    Emphasis and strong inlines.
*/
export default
{
    type: 'inline', 
    order: 30, 
    priority: 30,

    delims: [ `${s.fn.flank.r('\\*')}|${s.fn.flank.r('_')}` ],

    getDelimRun(part)
    {
        let { state: { open }, stream } = this;

        let beg = stream.back(open.delRe, part.index).clip();
        let end = stream.next(open.delRe, part.index).clip();
        // backwards search adjustment
        let index = beg ? beg.index - 1 : part.index;

        return stream.slice(index, end.endex);
    },

    getStatus(part)
    {
        let { state, stream } = this;
    
        let x = 
        {
            char: () => part[0],
            simple: () => p.char !== '_',
            delRe: () => p.simple ? state.starDelRe : state.underDelRe,
            rightRe: () => p.simple ? state.starRightRe : state.underRightRe,
            checkRe: () => p.simple ? state.starCheckRe : state.underCheckRe,
            left: () => this.open(part),
            right: () => !! stream.use(p.rightRe, part.index).clip(),
            drun: () => this.getDelimRun(part),
            opener: () => p.simple ? p.left : p.left && (!p.right || p.punctBefore),
            closer: () => p.simple ? p.right : p.right && (!p.left || p.punctAfter),
            dual: () => p.opener && p.closer,
            punctBefore: () => state.punctRe.test(stream.charAt(p.drun.index - 1)),
            punctAfter: () => state.punctRe.test(stream.charAt(p.drun.endex))
        }

        let p = new Proxy({}, { get: (o, n) => o[n] ??= x[n]() });

        return p;
    },

    consume(mark)
    {
        let { chunks, state } = this;

        if (chunks.length > 1)
        {
            let first = chunks[0];
            // cannot start with a raw delimiter character
            if (!first.agent && state.open.checkRe.test(first)) return this.retry();    

            let last = chunks[chunks.length - 1];
            // cannot end with a raw delimiter character
            if (!last.agent && state.open.checkRe.test(last)) return this.retry();
        }

        return res.consume(null, mark.endex);
    },

    retry() 
    {
        let { state } = this;
        return res.abort(state.retried ? void 0 : { single: !state.single, retried: true });
    },

    regex:
    {
        open: [ `${s.fn.flank.l('\\*')}|${s.fn.flank.l('_')}`, 'u' ],
        punct: [ s.upc, 'u' ],
        drun: `^${s.dr}$`,

        starDel: [ `${s.ne}\\*+`, 'y' ],
        starRight: [ s.fn.flank.r('\\*'), 'yu' ],
        starCheck: `^\\*|${s.ne}\\*$`,

        underDel: [ `${s.ne}_+`, 'y' ],
        underRight: [ s.fn.flank.r('_'), 'yu' ],
        underCheck: `^_|${s.ne}_$`,
    },

    action:
    {   
        open(part, state)
        {
            state.open = this.getStatus(part);
            // abort if we cannot really open here
            if (!state.open.opener) return res.abort();
            // determine if we use one or two markers (emph vs strong)
            // this may have already been determined via abort/retry
            state.single ??= !! ((state.open.drun.endex - part.index) % 2);
            state.openLen = state.single ? 1 : 2;
            // track closing marks
            state.nonClosers = [];

            return res.block(null, part.index + state.openLen);
        },

        next(part, state)
        {
            let { open } = state;
            // must be of same character in separate delimiter runs
            if (part.valueOf() === open.char && part.index > open.drun.endex)
            {
                let close = this.getStatus(part);
                // re-slice part in case mre than 1 char
                let mark = this.stream.slice(part.index, part.index + state.openLen);
                // `mark` must still qualify as being part of the run
                if (state.drunRe.test(mark) && mark.length === state.openLen)
                {
                    // check run "sync" if `open` or `close` can close or open, respectively
                    if ((open.dual || close.dual))
                    {
                        if (isRunSynced(open.drun, close.drun)) return this.consume(mark);
                    }
                    else if (close.closer) 
                    {
                        return this.consume(mark);
                    }
                    // accept and move on as this is not our closing mark
                    return res.accept(mark, mark.endex);    
                }
                
                if (close.closer)
                {
                    state.nonClosers = [ ...state.nonClosers, part];
                    // retry when enough smaller closers to consume our open have passed
                    if (state.nonClosers.join('').length >= state.openLen) return this.retry();    
                }
            }

            // accept part and keep waiting for close                
            return res.accept(part);
        }
    },

    compile: (content, state) =>
    {
        let name = state.openLen === 1 ? 'emphasis' : 'strong';
        return { name, chunks: content };
    },

    delouse: [ 'common' ]
}
