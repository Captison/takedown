import profile from './profile'
import runner from './run-cases'


let testCaseUrl = 'https://spec.commonmark.org/0.31.2/spec.json';
let profileOutputFile = './temp/profile.cpuprofile';

let exec = cases => runner(cases, process.argv.slice(2));

console.log('Downloading test cases...');
fetch(testCaseUrl).then(res => 
{
    if (!res.ok) throw new Error(res.status);  
    res.json().then(profile(profileOutputFile, exec));
});


