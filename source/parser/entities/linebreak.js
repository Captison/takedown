import res from '../lib/action-response.js'


/*
    Hard line break inline.
*/
export default
{
    type: 'inline',
    order: 50,
    priority: 50,

    regex:
    {
        open: '(?:  +|\\\\)\\n'
    },

    action:
    {
        open: () => res.accept(),
        next: () => res.reject()
    },

    compile: {}
}
