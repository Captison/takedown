#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import takedown from 'takedown'


let [ source, target ] = process.argv.slice(2);

let name = path.basename(source, path.extname(source));

target ??= path.join(path.dirname(source), name) + '.html';

fs.readFile(source, { encoding: 'utf8' }).then(markdown => 
{
    let td = takedown({ convert: { root: e => (e.title = name, html) } });
    
    let { doc } = td.parse(markdown);

    fs.writeFile(target, doc, { encoding: 'utf8' })
      .then(() => console.log(source, '=>', target));
});

let html =
`
<html>
<head>
  <title>{title}</title>
</head>
<body>
  {value}
</body>
</html>
`;
