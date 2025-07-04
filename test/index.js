import takedown from '../source/index.js'
import profile from './profile.js'
import runner from './run-cases.js'


// let spc = (str, ct) => str + ' '.repeat(ct - str.length)
// let id = model => `${model.type}-${model.name}:${model.id}`
// let onAction = ({ action, entity, parent, chunk, index }) =>
// {
//     let entityId = id(entity);
//     let parentId = parent ? id(parent) : '';
//     let chunkId = chunk && `${index}:${chunk.replace(/ /g, '·').replace(/\n/g, '⏎').replace(/\t/g, '⤇')}`;
    
//     console.log('๏', spc(parentId, 21), '๏', spc(entityId, 21), '๏', spc(action, 8), '๏', chunkId);
// }

let td = takedown();

let testCaseUrl = 'https://spec.commonmark.org/0.31.2/spec.json';
let outfile = './temp/profile.cpuprofile';
let args = process.argv.slice(2);
let run = args => cases => runner(s => td.parse(s).doc, cases, args);
let exec = args[0] === 'profile' ? profile(outfile, run(args.slice(1))) : run(args)

console.log('Downloading test cases...');
fetch(testCaseUrl).then(res => 
{
    if (!res.ok) throw new Error(res.status);  
    res.json().then(exec);
});
