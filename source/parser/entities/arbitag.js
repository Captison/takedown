import res from '../lib/action-response'


// let raw = [ 'pre', 'script', 'style', 'textarea' ];

/*
    Html block (type 7).
*/
export default s =>
{
    let entity = { type: 'block', order: 11 };
  
    entity.state =
    {
        rejectOnForcedClose: true
    }

    entity.regex =
    {
        open: `${s.sol}(?=<[^\\n]+?>)(?:${s.hot}|${s.hct})${s.sot}*${s.eol}`,
        blank: s.bl
    }

    entity.action =
    {
        open(line)
        {
            return res.accept(this.getPruning(line).pruned);
        },

        next(line, state)
        {
            let { pruned } = this.getPruning(line);

            if (state.blankRe.test(pruned)) 
                return res.consume();
            
            return res.accept(pruned);
        }
    }

    entity.compile = content => ({ name: 'htmlblock', chunks: content });

    return entity;
}
