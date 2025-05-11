
# Undocumented

This file describes features and configs that are not officially part of the Takedown documentation and may not even work as described (or even be implemented yet).

Everything here is subject to change (or removal) in future revisions, regardless of semver version level.


## Command Line Interface

There is a very limited CLI included called `td`.  

It currently accepts only an input file and an output file and does not allow for configuration.

```shell
> td path/to/source.md path/to/target.html
```

This will be updated to be more extensive in the future.


## Additional Config Settings

### `convertTabsAfter`

Array of regular expression strings that identify block element (quotation, listitem, etc.) markers in which each tab character in the immediately following whitespace will be converted to the appropriate number of spaces in order to reach the next tab stop.  The `tabSize` setting determines the size of a tab stop.

The markdown source will have tabs converted to spaces as per the above before parsing begins.  This preliminary action aids the parser in determining the proper structure for block elements.

Default:

```js
convertTabsAfter: 
[
    '^',
    // listitem 
    '[*+-]', '\\d+[.)]',
    // quotation
    '>',
],
```


### `tabSize`

Size of a tab in spaces (i.e., number of spaces used to replace a tab character).  

This value does not affect the way spacing is interpreted by the parser, so changing this value can drastically change the way the parser interprets document structure. 

Default:

```js
tabSize: 4
```


### `delouse`

Arrays of search and replace configurations for removing/replacing elements in the parsed content.

This setting uses the same `convert` setting names to define search & replace for their insertion variables.

The available delousers are:
- `commonHtmlEnts`: converts `&`, `"`, `<`, and `>` characters to html entities
- `encodeUriChars`: performs uri encoding (excluding '%' char)
- `htmlEntsToChars`: converts HTML entities to unicode characters
- `lineEndToSpace`: converts each line ending to a single space
- `trimAroundNewline`: removes all whitespace before and after a newline
- `trimEncSpace`: chops a space from start and end for non-all-whitespace content
- `trimEnd`: removes all whitespace from the end
- `unescapePunct`: removes unescaped backslashes appearing before ascii punctuation

The following delousers combine one or more of the above:
- `common`: performs `htmlEntsToChars`, `unescapePunct`, and `commonHtmlEnts`
- `uri`: performs `htmlEntsToChars`, `unescapePunct`, `encodeUriChars`, and `commonHtmlEnts`

Default:

```js
delouse:
{
    autolink:
    {
        value: [ 'htmlEntsToChars', 'commonHtmlEnts' ],
        url: [ 'htmlEntsToChars', 'encodeUriChars', 'commonHtmlEnts' ]
    },
    code: [ 'lineEndToSpace', 'trimEncSpace', 'commonHtmlEnts' ],
    codeblock: [ 'commonHtmlEnts' ],
    fenceblock:
    {
        value: [ 'commonHtmlEnts' ],
        info: [ 'common' ]
    },
    email:
    {
        value: [ 'commonHtmlEnts' ],
        email: [ 'commonHtmlEnts' ]
    },
    emphasis: [ 'common' ],
    header: [ 'common' ],
    image:
    {
        value: [ 'common' ],
        href: [ 'uri' ],
        title: [ 'common' ]
    },
    link:
    {
        value: [ 'common' ],
        href: [ 'uri' ],
        title: [ 'common' ]
    },
    paragraph: [ 'trimAroundNewline', 'common' ],
    quotation: [ 'trimEnd' ],
    setext: [ 'trimAroundNewline', 'common' ],
    strong: [ 'common' ],
}
```

For the `value` insertion variable, delousers are applied to each text node within rather than the entire string.


### `nestable`

Defines markdown entity parent/child relationships.

Default:

```js
nestable:
{
    emphasis: [ 'autolink', 'code', 'email', 'emphasis', 'image', 'linebreak', 'link' ],
    header: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'link' ],    
    image: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'image', 'link' ],
    link: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'image', 'link' ],
    listitem:
    [ 
        'arbitag', 'autolink', 'code', 'codeblock', 'codefence', 
        'divide', 'email', 'emphasis', 'header', 'html',
        'htmlblock', 'image', 'linebreak', 'link', 'list',
        'paragraph', 'quotation', 'reference', 'setext'
    ],
    paragraph: [ 'autolink', 'code', 'email', 'emphasis', 'html', 'image', 'linebreak', 'link' ],
    quotation:
    [ 
        'arbitag', 'autolink', 'code', 'codeblock', 'codefence', 
        'divide', 'email', 'emphasis', 'header', 'html',
        'htmlblock', 'image', 'linebreak', 'link', 'list',
        'paragraph', 'quotation', 'reference', 'setext',
    ],
    root:
    [ 
        'arbitag', 'autolink', 'code', 'codeblock', 'codefence', 
        'divide', 'email', 'emphasis', 'header', 'html',
        'htmlblock', 'image', 'linebreak', 'link', 'list',
        'paragraph', 'quotation', 'reference', 'setext',
    ],
    setext: [ 'autolink', 'code', 'emphasis', 'html', 'image', 'linebreak', 'link' ]
},
```

Entities do not necessarily map 1-1 with converters.


## Extensions

> NOTE: None of this has been implemented yet.

The `extend` method of the Takedown factory object can generate a new, extended factory.

```js
import takedown from 'takedown'
import * as exts from 'extLibrary'
import myExtension from './my-extension'

let takedownExt = takedown.extend(myExtension, ...exts);
// use the new factory to create instances
let tde = takedownExt({ ... });
```

An extension is simply a function that accepts a configuration object.  The function should then update or add to that object as necessary (return value is ignored).  `extend` will call each extension function in the order given, and the resulting configuration adjustments will become the "default" configuration for the new factory returned from `extend`.

The factory returned from `extend` has all the same utility as the default factory from import, including the `extend` method.

This extension approach also allows for instances to be updated directly.

```js
let td = takedown();

[ myExtension, ...exts ].forEach(ext => ext(td.config));
```
