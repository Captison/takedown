import takedown from '../source'
import profile from './profile'
import runner from './run-cases'


let td = takedown();

let testCaseUrl = 'https://spec.commonmark.org/0.31.2/spec.json';
let outfile = './temp/profile.cpuprofile';
let args = process.argv.slice(2);
let run = args => cases => runner(s => td.parse(s), cases, args);
let exec = args[0] === 'profile' ? profile(outfile, run(args.slice(1))) : run(args)

console.log('Downloading test cases...');
fetch(testCaseUrl).then(res => 
{
    if (!res.ok) throw new Error(res.status);  
    res.json().then(exec);
});
