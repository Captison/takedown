import TakedownError from '../../../error/TakedownError'
import arbiter from './arbiter'
import closer from './closer'
import pruning from './pruning'


let counter = 100;
// let spc = (str, ct) => str + ' '.repeat(ct - str.length)
// let actionLog = (model, parent, action, chunk) =>
// {
//     let chunkId = chunk && `${chunk.id}:${chunk.replace(/ /g, '·').replace(/\n/g, '⏎').replace(/\t/g, '⤇')}`;
//     console.log('๏', spc(parent?.id || '', 21), '๏', spc(model.id, 21), '๏', spc(String(action), 8), '๏', chunkId);
// }

export default function ()
{
    let self = { agent: true }, parent, model;
    // parsing context elements
    let agent, current, document, madoe, stream, streamFn;
    // entity state tracking
    let state, backstate;
    // entities by type sorted by order; entity index tracker
    let mdents, nendex;
    // agent entity close handler
    let close = closer(self);


    let init = (context, entity, branch) =>
    {
        ({ agent, current, document, madoe, stream, streamFn } = context);
        
        let ent = madoe(entity);

        state = { ...ent.state };
        backstate = [ { ...state }, { ...state } ];
        mdents = madoe.filterSort(ent.type, ent.nestable); 
        nendex = 0;
        parent = branch;

        model =
        {
            ...ent,
            
            agent: true,
            id: `${ent.type}-${ent.name}:${(counter++ * 17).toString(32)}`,
            chunks: [],
            current,
            document,
            getPruning: pruning(self),
            opens,
            stream: streamFn,
            // starting/ending indexes in source
            index: -1, endex: -1,

            prune: chunk => chunk ? ent.prune.call(model, chunk, state) : null,
            toString: () => model.chunk.valueOf(),

            get chunk() { return streamFn.slice(model.index, model.endex); },
            get content() { return model.chunks.join(''); },
            get inliner() 
            { 
                if (model.type === 'block' && model.nestable?.length) 
                    return context.inlineParser(model); 

                return void 0;
            },
            get state() { return state; },
        }

        self.parent = parent; self.model = model;
        // parentless (root) agent always priority 0
        self.priority = parent ? model.priority : 0;
        // get entity open for `chunk`
        self.open = chunk => model.open(chunk, state)
        // get entity response for `chunk`
        self.action = chunk => model.action(chunk, state)
        // chunk action resolution
        self.arbitrate = arbiter(parent, self);
        // chunk processing
        self.next = next; self.exec = execute;
        // agent/chunk abortions/additions
        self.abort = abort; self.apply = apply;

        return self;
    }

    /*
        Checks to see if at least one named entity can open as a peer 
        (sibling).

        This should never be called from root entity.
    */
    let opens = (chunk, ...names) => names.findIndex(name => agent(name, parent).open(chunk)) >= 0 
    // let opens = (chunk, ...names) => names.findIndex(name => agent(name, self).open(chunk)) >= 0 

    /*
        Advance to next entity, reset state, and rewind iterator.

        @param { object } restate
          Retry state.
    */
    let abort = (aborted, restate) => 
    {
        let { model } = aborted;

        let retry = typeof restate === 'object';
        // advance entity search index (skip `agent`)
        if (!retry) nendex ++; 
        // return state to moment before acceptance
        state = { ...backstate[1] };
        // move streamer back to index of first chunk in `agent`
        stream.goto(model.index);
        // retry parsing with modified version of same entity
        return retry ? agent(madoe.custom(model.name, { state: restate }), self) : self;
    }

    /*
        Append chunk (or agent), reset entity index, advance entity state.
    */
    let apply = (chunk, value) => 
    {                    
        if (chunk.agent)
        {
            model.chunks.push(chunk.model);
            model.endex = chunk.model.endex; 
        }
        else
        {
            if (value.valueOf()) model.chunks.push(value);
            model.endex = chunk.endex; 
        } 

        // reset entity search index
        nendex = 0;
        // return state to moment of acceptance
        state = { ...backstate[0] };

        return self;
    }

    /*
        Look for a nestable entity that can accept `chunk`.
    */
    let spawn = chunk =>
    {
        for (;nendex<mdents.length;nendex++)
        {
            let ent = mdents[nendex];
            // when parentless make sure this entity can be top-level
            if (parent || !ent.uproot) 
            {
                let candidate = agent(ent, self);
                let response = candidate.open(chunk);
                // response can be an action here
                if (response) return candidate.next(chunk, response);
            }
        }
    }

    /*
        Processes a document chunk based on the desired `action`.

        If `action` is not specified, it will be derived from entity 
        action arbitration.

        @param { object } action
          Action to be performed.
    */
    let next = (chunk, action) =>
    {
        current.model = model; current.chunk = chunk;
        // update starting index if not already set
        if (model.index < 0) model.index = model.endex = chunk.index;
        // do arbitration if no action specified
        if (!action?.action) action = self.arbitrate(chunk);
        // track previous states for apply/abort
        backstate = [ { ...state }, backstate[0] ];

        return execute(chunk, action);
    }

    /*
        Executes the specified `action` on behalf of entity on `chunk`.
    */
    let execute = (chunk, action) =>
    {
        // set next parsing index if >= current index
        if (typeof action.endex === 'number' && action.endex >= chunk.index)
        {
            stream.goto(action.endex);
            // update parsed chunk to be the slice desired
            chunk = streamFn.slice(chunk.index, action.endex);
            // set action value as well if desired
            if (action.value === true) action.value = chunk;
        }

        // actionLog(model, parent?.model, action, chunk);

        // continue and look for children
        if (action.accept) return spawn(chunk) || apply(chunk, action.value);
        // continue without looking for children
        if (action.block) return apply(chunk, action.value);
        // exclude chunk from output and continue
        if (action.censor) return self;
        // parentless (root) agents must close here
        if (!parent) return close();
        // close and consume current chunk
        if (action.consume) return (apply(chunk, action.value), close());
        // close without consuming chunk
        if (action.reject) return close(chunk);
        // abandon everything including current chunk
        if (action.abort) return parent.abort(self, action.value);

        // definitely an error by now
        throw new TakedownError(`"${action}" is not a valid entity action response`);
    }

    return init;
}
