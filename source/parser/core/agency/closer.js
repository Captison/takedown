import res from '../../lib/action-response'


export default function (self)
{
    /**
        Applies this agent to its parent (if existing).

        Remaining `chunk` is passed on to parent or self on 
        successful close.

        @param { String } chunk
            Most recent (rejected) source chunk.
    */
    return chunk =>
    {
        let { model, parent } = self;

        let closed = model.close(model.state);

        if (closed === true)
        {
            if (model.removeSameAncestor)
            {
                let agent = self;
                // find an ancestor with same name
                while (agent = agent.parent) 
                    if (agent.model.name === model.name) 
                        break;

                // abort the ancestor (results in error if root)
                if (agent) return agent.exec(chunk, res.abort());
            }
            // apply to parent if existing
            let agent = parent ? parent.apply(self) : self;
            // if a chunk was provided, pass it on
            return chunk ? agent.next(chunk) : agent;
        }

        // abort on unsuccessful close
        return self.exec(chunk, res.abort(closed));
    }
}
