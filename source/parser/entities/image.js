import linked from './base/linked'


/*
    Image inline.
*/
export default s =>
{
    let inc = linked(s);

    let entity = { ...inc };

    entity.state =
    {
        ...inc.state,
        name: 'image'
    }

    entity.regex =
    {
        ...inc.regex,
        open: s => `${s.ne}!\\[(?=.*?${s.ne}\\])`
    }

    return entity;
}
