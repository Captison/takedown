
export default function (config)
{
    let edata = ({ name, type, id }) => ({ name, type, id })
    
    return (parent, model, action, chunk) =>
    {
        if (config.onAction)
        {
            let details =
            {
                action: String(action),
                entity: edata(model),
                chunk: chunk?.toString(),
                index: chunk?.index,
            };

            if (parent) details.parent = edata(parent.model);

            config.onAction(details);
        }
    }
}
