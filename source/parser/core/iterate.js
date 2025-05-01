
export default function (agent, iterator) 
{     
    for (let chunk of iterator) 
        agent = agent.next(chunk); 

    return agent; 
}
