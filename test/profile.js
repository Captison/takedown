import { Session } from 'node:inspector/promises';
import fs from 'node:fs/promises';
import path from 'node:path'


export default (file, fn) => async (...args) =>
{
    let session = new Session();

    let filename = path.resolve(file);
    let dirname = path.dirname(filename);

    session.connect();
    
    await session.post('Profiler.enable');
    await session.post('Profiler.start');

    let retval = fn(...args);

    let { profile } = await session.post('Profiler.stop');
    let formatted = JSON.stringify(profile, null, 4);    
    // console.log(formatted);
    fs.mkdir(dirname, { recursive: true }).then(() => fs.writeFile(filename, formatted)); 
    
    session.disconnect();

    return retval;
}
