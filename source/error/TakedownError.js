

/* 
    For Takedown-specific error messages
*/
export default class TakedownError extends Error
{
    constructor(message)
    {
        super(message);
    }
}
