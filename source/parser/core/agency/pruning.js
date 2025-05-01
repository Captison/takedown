
export default function (self)
{
    /**
        Gets chunk pruning data for this agent and its ancestor tree.

        The returned array will aslo include the `prunable` property.

        @param { String } chunk
          Chunk to be pruned.
        @return { array }
          `chunk` pruned versions from this agent to root.
    */
    let getPruning = chunk =>
    {
        let stack = [ self ], agent = self;
        // make ancestor stack with root at 0
        while (agent = agent.parent) stack.unshift(agent);

        let reducer = (arr, { model }) => ([ model.prune(arr[0]), ...arr ])
        // pruned strings from each level with self at 0
        let pruning = stack.reduce(reducer, [ chunk ]);
        // index of closest successfully pruned chunk
        pruning.at = pruning.findIndex(pruned => pruned !== null);
        // full set of markers is present on the line
        pruning.marked = pruning.at === 0;
        // the pruned line (final)
        pruning.pruned = pruning[pruning.at];

        return pruning;
    }  

    return getPruning;
}
