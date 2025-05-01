import linked from './base/linked'


/*
    Link inline.
*/
export default s =>
{
    let inc = linked(s);

    let entity = { ...inc };

    entity.removeSameAncestor = true;

    entity.state =
    {
        ...inc.state,
        name: 'link'
    }

    entity.regex =
    {
        ...inc.regex,
        open: s => `${s.ne}\\[(?=.*?${s.ne}\\])`
    }

    return entity;
}
