import chalk from 'chalk'
import takedown from '../source'


let { stdout: so } = process;

export default (cases, list) =>
{
    let include = tc =>
    {
        if (!list?.length) return true;
        if (list.includes(String(tc.example))) return true;
        if (list.includes(tc.section)) return true;
        return false;
    }

    let td = takedown({ fmCapture: null });

    let test = tc =>
    {
        let { markdown, html, example, section } = tc;

        so.write(`Running test case ${example} ${section}... `);
        
        let beg = performance.now();
        let result = td.parse(markdown);
        let end = performance.now();
        
        let time = Math.round((end - beg) * 1000) / 1000;
        let status = html === result ? chalk.greenBright('PASS') : chalk.redBright('FAIL');
        so.write(`${status} (${time}ms)\n`);

        return { ...tc, result };
    }

    let count = {}, passed = {};

    let record = tc =>
    {
        let { html, result, section } = tc;

        count.Total ??= 0;
        passed.Total ??= 0;

        count[section] ??= 0;
        passed[section] ??= 0;

        count.Total ++;
        count[section] ++;

        if (result === html)
        {
            passed.Total ++;
            passed[section] ++;
        }

        return tc;
    }

    let data = [];

    let report = tc =>
    {
        let { markdown, html, result, example, section } = tc;

        if (result !== html)
        {
            console.log('::::::::::::::::::::::::::::::::::::::::::::::::::');
            console.log(`${section} example ${example} failed.\n`);
            console.log(`Markdown (${markdown.length} chars):`);
            console.log(`${markdown.replace(/\t/g, '⤇').replace(/ /g, '·').replace(/\n/g, '⏎$&')}`);
            console.log(`Expected (${html.length} chars):`);
            console.log(`${html}`);
            console.log(`Received (${result.length} chars):`);
            console.log(`${result}`);
            console.log('::::::::::::::::::::::::::::::::::::::::::::::::::');
        }
    }

    console.log('\nRunning test cases...');
    let beg = performance.now();
    data = cases.reduce((a, tc) => (include(tc) && a.push(record(test(tc))), a), []);        
    let end = performance.now();
    let time = Math.round(end - beg) / 1000;        
    console.log(chalk.whiteBright(`\n${count.Total} test cases finished in ${time} seconds`));

    console.log('\nGenerating failed test case reports...');
    data.forEach(report);

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
