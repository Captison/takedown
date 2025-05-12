import res from '../lib/action-response.js'
import s from '../lib/reparts.js'


// let raw = [ 'pre', 'script', 'style', 'textarea' ];

/*
    Html block (type 7).
*/
export default
{
    type: 'block', 
    order: 11,
  
    state:
    {
        rejectOnForcedClose: true
    },

    regex:
    {
        open: `${s.sol}(?=<[^\\n]+?>)(?:${s.hot}|${s.hct})${s.sot}*${s.eol}`,
        blank: s.bl
    },

    action:
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
    },

    compile: content => ({ name: 'htmlblock', chunks: content })
}
