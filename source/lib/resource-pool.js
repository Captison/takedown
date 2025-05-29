
/*
    Simple reusable resource pooling.
*/
export default function (create, size = 20)
{
    let pool = {}, pooled = [];

    pool.get = () => pooled.length ? pooled.pop() : create()

    pool.renew = elem => 
    {
        pooled.unshift(elem);
        if (pooled.length > size) pooled.pop();
    }

    return pool;
}
