import chalk from 'chalk'
import cases from './test-cases'
import takedown from '../source'


let runner = list =>
{
    let td = takedown({ fmCapture: null });

    console.log('Running test cases...');
    let count = { Total: 0 }, passed = { Total: 0 };

    cases.forEach(testcase => 
    {
        let { markdown, html, example, section } = testcase;

        if (list.length && !(list.includes(String(example)) || list.includes(section))) return;

        console.log('::::::::::::::::::::::::::::::::::::::::::::::::::');
        let result = td.parse(markdown);

        count.Total ++;
        count[section] = (count[section] || 0) + 1;
        passed[section] ??= 0;
        
        if (result === html)
        {
            passed.Total ++;
            passed[section] ++;

            console.log(`${section} example ${example} passed!\n`);
        }
        else
        {
            console.log(`${section} example ${example} failed.\n`);
            console.log(`Markdown (${markdown.length} chars):`);
            console.log(`${markdown.replace(/\t/g, '⤇').replace(/ /g, '·').replace(/\n/g, '⏎$&')}`);
            console.log(`Expected (${html.length} chars):`);
            console.log(`${html}`);
            console.log(`Received (${result.length} chars):`);
            console.log(`${result}`);
        }
    });

    let display = (key, name = key) =>
    {
        let pct = passed[key] / count[key];
        
        let ratio = `${passed[key]}/${count[key]}`;
        let percent = (Math.round(pct * 10000) / 100) + '%'
        
        ratio += ' '.repeat(13 - ratio.length);
        percent += ' '.repeat(13 - percent.length);

        let line = ratio + percent + name;

        if (pct === 1) return chalk.greenBright(line);
        if (pct >= 0.9) return chalk.cyan(line);
        if (pct <= 0.1) return chalk.red(line);
        if (pct <= 0.3) return chalk.yellow(line);

        return line;
    }

    console.log();
    console.log(chalk.whiteBright('   Test Case Results - Passing Scores  '));
    console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::');
    for (let key in count) key !== 'Total' && console.log(display(key));
    console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::');
    console.log(chalk.whiteBright(display('Total', 'TOTAL')));
    console.log();
}

// let indexes = process.argv.slice(2), tests = cases;

// if (indexes.length) tests = indexes.reduce((arr, idx) => [ ...arr, cases[idx - 1] ], [])

runner(process.argv.slice(2));
