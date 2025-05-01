import res from '../../lib/action-response'


/*
    Creates a function to determine the final child action for a chunk of a 
    markdown document.  
    
    The function also resolves disputes between parent and child actions to 
    produce a final action.
*/
export default function (parent, child)
{
    // wrapper to execute only when `chunk` exists
    let whenExists = fn => chunk =>
    {
        // empty chunk is effective EOF, reject/abort automatically
        if (!chunk.valueOf())
            return !parent || child.model.state.rejectOnForcedClose ? res.reject() : res.abort();
        
        return fn(chunk);
    };

    // higher priority is the lower number
    let childIsBoss = !parent || child.priority < parent.priority;
    // child does what it wants with no parent around
    if (childIsBoss) return whenExists(chunk => child.action(chunk));

    /*
        Determine the course of action for a chunk.

        As this function is recursive it should be set on parent (and child) 
        objects as `arbitrate`.
    */
    return whenExists(chunk =>
    {    
        let action = child.action(chunk);
        // child can always close if it wants to
        if (action.reject) return action;
        // see what parent wants to do
        let parentAction = parent.arbitrate(chunk);
        // parent allows child to do what it wants
        if (parentAction.accept || parentAction.censor || parentAction.abort) return action;
        // allow child to close on same chunk
        if (parentAction.consume && action.consume) return action;
        // parent wants to reject or block
        return child.model.state.rejectOnForcedClose ? res.reject() : res.abort();
    });
}
