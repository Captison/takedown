
![logo](source/assets/logo-main-med.png)

*A markdown parser that puts you in control.*

The goal of this project is to have a compliant markdown parser that also allows for full control of the target document structure without going through an AST.

## How do I use this?

Install.

```shell
> npm install takedown --save
```

import or require...

```js
import takedown from 'takedown'
// or, for commonjs
let takedown = require('takedown').default
```

and then...

```js
let markdown = 'Your markdown *here*!';
// create an "instance"
let td = takedown();
// make some HTML!
let html = td.parse(markdown);
// => <p>Your markdown <em>here</em>!</p>
```

Simple!


## What's the API here?

The following sections detail the api for a takedown parser instance.

```js
let td = takedown();
```

### `td.config: object`

A proxy object for managing instance configuration.

Configuration values can be set when creating a parser instance. 

```js
let quotation = '<div class="blockquote">{value}</div>';

let td = takedown({ convert: { quotation } });
```

And `config` allows them to be updated directly on the instance.

```js
td.config = { convert: { quotation } };
// or
td.config.convert = { quotation };
// or
td.config.convert.quotation = quotation;
```

All of the update methods above have the same effect (i.e., only `config.convert.quotation` setting is affected and previous defaults/changes remain in place).  Errors are thrown for bad config settings.

The config options are detailed further down.

### `td.parse(markdown: string): string`

Where all the magic happens.  This function takes `markdown` and converts it to HTML (or whatever document structure is configured).

```js
let html = td.parse('Welcome to **Takedown**!');
// => <p>Welcome to <strong>Takedown</strong>!</p>
```

The output of this function is dependent on entity converters. (see `convert` config option).

### `td.parseMeta(markdown: string): object`

Gets front-matter from a document as object data.  Returns `undefined` if `fm.enabled` is `false`.

```js
td.config.fm.enabled = true;
// front-matter is parsed as JSON by default
let fm = td.parseMeta(markdown);
```

See the `fm` config option for more details on how front-matter is handled.

### `td.partition(markdown: string): array`

Separates markdown content from front matter as per `fm.capture`, and returns the two raw parts in an array.

If you do

```js
let [ source, matter ] = td.partition(`
---
title: Markdown Page
---
# First Header Element
`);
```

then `source` would be

```md
# First Header Element
```

and `matter` would be

```md
---
title: Markdown Page
---
```

If `fm.enabled` is `false`, then `matter` will be `undefined`.


## What are the config options?

### `convert`

Strings and/or functions that specify how markdown entities are converted to document structure. 

A string will be interpolated using insertion variables (as per `What is "string conversion"?` section below).

A function should be of the form `(data: object, vars: object): string` where
- `data` contains converter insertion variables, and
- `vars` are the configured variables (see `vars` config option)

Strings returned from converter functions will also be interpolated.

Here are the defaults with insertion variable names explained:

```js
convert:
{
    /*
        value - display URL
        url - encoded URL
    */
    autolink: '<a href="{url}">{value}</a>',
    /*
        value - inline code text
        ticks - opening ticks
    */
    code: '<code>{value}</code>',
    /*
        value - code block source
    */
    codeblock: '<pre><code>{value}</code></pre>\n',
    /*
        marks - symbols used for thematic break
    */
    divide: '<hr />\n',
    /*
        value - email address
        email - email address
    */
    email: '<a href="mailto:{email}">{value}</a>',
    /*
        value - emphasis text
        child - child data
    */
    emphasis: '<em>{value}</em>',
    /*
        value - fence block source
        info - fence block info-string
        fence - opening ticks
    */
    fenceblock: e =>
    {
        e.lang = e.info?.match(/^\s*([^\s]+).*$/s)?.[1];
        return '<pre><code{? class="language-{lang}"?}>{value}</code></pre>\n'
    },
    /*
        value - header tag content
        level - header level (1-6)
        child - child data
    */
    header: '<h{level}>{value}</h{level}>\n',
    /*
        value - inline html content
    */
    html: '{value}',
    /*
        value - block html content
    */
    htmlblock: '{value}',
    /*
        value - image description
        href - encoded image URL
        title - image description
        child - child data
    */
    image: e =>
    {
        e.alt = e.value.replace(/<[^>]+?(?:alt="(.*?)"[^>]+?>|>)/ig, '$1');
        return `<img src="{href}" alt="{alt}"{? title="{title}"?} />`;
    },
    /*
        nada.
    */
    linebreak: '<br />',
    /*
        value - link text
        href - encoded link URL
        title - link description
        child - child data
    */
    link: '<a href="{href??}"{? title="{title}"?}>{value}</a>',
    /*
        value - list item content
        tight - should paragraphs be suppressed?
        child - child data
    */
    listitem: e =>
    {
        e.nl = e.child.count && (!e.tight || e.child.first !== 'paragraph') ? '\n' : '';
        return '<li>{nl}{value}</li>\n';
    },
    /*
        value - list content
        start - starting index
        tight - should paragraphs be suppressed?
        child - child data
    */
    olist: e => `<ol${e.start !== 1 ? ` start="${e.start}"` : ''}>\n{value}</ol>\n`,
    /*
        value - paragraph content
        child - child data
    */
    paragraph: ({ parent: p, index }) => 
        p.tight ? '{value}' + (p.child.count - 1 === index ? '' : '\n') : '<p>{value}</p>\n',
    /*
        value - block quote content
        child - child data
    */
    quotation: '<blockquote>\n{value}</blockquote>\n',
    /*
        value - entire document output
        child - child data
    */
    root: '{value}',
    /*
        value - setext header tag content
        level - setext header level (1-2)
        child - child data
    */
    setext: '<h{level}>{value}</h{level}>\n',
    /*
        value - strong emphasis text
        child - child data
    */
    strong: '<strong>{value}</strong>',
    /*
        value - list content
        tight - should paragraphs be suppressed?
        child - child data
    */
    ulist: '<ul>\n{value}</ul>\n'
}
```

**All** of the target document structure is defined in the `convert` settings.

Use only `{value}` to render without formatting.

```js
// no header tags!
td.config.convert = { header: '{value}' }
```

Omit `{value}` to suppress descendant output.

```js
// no header content!
td.config.convert = { header: '<h{level}> no header content </h{level}>\n' }
```

Set to `null` or empty string to turn off output completely.

```js
// no more headers!
td.config.convert = { header: null }
```

Where the `child` insertion variable is available, it will be an object having
- `count`: number of child entities (including text nodes)
- `first`: converter name of the first child (or `text` for text node)
- `last`: converter name of the last child (or `text` for text node)

Some additional variables are also available for every converter.
- `name`: converter name
- `parent`: parent converter's insertion variables (excluding `value`)
- `index`: numeric position of the entity in the parent converter

The values of `parent` and `index` will be undefined for the `root` converter.

### `fm`

Settings for handling markdown front-matter.

Here are the defaults:

```js
fm:
{
    enabled: false,
    capture: /^---\s*\n(?<fm>.*?)\n---\s*/s,
    parser: source => JSON.parse(source),
    useConfig: 'takedown',
    varsOnly: false
}
```

Here's a rundown of the individual `fm` settings:

- **`enabled`** (*boolean*) \
  Set to `true` to activate front-matter features.  When `false`, `td.parseMeta` returns `undefined`, and `td.parse` assumes everything in the document is markdown.

- **`capture`** (*RegExp*) \
  The regular expression to match front-matter.  It must have an `<fm>` capture group as its contents will be passed to the `parser` function.

- **`parser`** (*function*) \
  Document content from `capture` is passed to this function for parsing.  It should return an object with document metadata.

- **`useConfig`** (*boolean|string*) \
  Names a key in front-matter containing additional config options for the document.  These options will be merged atop defaults and any manually set options.  A value of `true` indicates the front-matter itself is config options.  Use `false` to turn this off completely.

- **`varsOnly`** (*boolean*) \
  When set to `true`, front-matter configuration is assumed to consist solely of variable (`vars`) definitions, and will be merged accordingly.  Has no effect if `useConfig` is `false`.

> For obvious reasons, `fm` settings appearing in front-matter are ignored.

### `vars`

Insertion variables used in string conversion or passed to conversion functions.

Variable names can include only letters, numbers, and underscores.  Nested variables (objects) are allowed and you can use dot-notation to access them in string conversion.

There are no default `vars`, but here's a shameless example.

```js
vars:
{ 
    something: 'Takedown rules' 
}
```

After setting a variable (above), use it in a converter like so

```js
convert:
{ 
    emphasis: '<em>I gotta tell you {something}!</em>' 
}
```

To make a "dynamic" variable, use a function.  Functions will be called with the current converter's insertion variables in string conversion.  However, functional converters will have to invoke function variables manually.


## What is "string conversion"?

It is how strings are interpolated with insertion variables.

There are two facets here:

- **variables** \
  To insert a variable into a string, use `{name}`, where `name` is the name of the variable to be inserted.  If the replacement value is `null` or `undefined`, no replacement is made and the string remains as-is.  Only letters, numbers, underscores, and periods are valid characters for `name`.

  To ensure replacement, use `{name??text}` syntax where `text` is the literal value to use when `name` is nullish.

- **segments** \
  Use `{?content?}` syntax to identify an optional portion (segment) of the string where `content` will only be rendered if at least one internal variable is replaced.  That is, if variable replacement within `content` results in the exact same string, the entire segment will be omitted.  

  Nested segments are processed inside-out, with the results of inner segments constituting the initial state of outer ones.


## What else do I need to know?

### CommonMark

Takedown's parsing and HTML generation out-of-the-box is [CommonMark](https://spec.commonmark.org) compliant as per spec version **0.31.2**.  The implementation is pure vanilla and does not add anything to the spec.

There are extra steps taken in the default `convert` settings (mostly concerning the placement of newlines) to get the output just right for matching the CM test-cases, but these have no effect on the structural correctness of the html output.

### Test

To run tests, do

```shell
> npm test
```

The test runner will download the [test-cases](https://spec.commonmark.org/0.31.2/spec.json) so an internet connection will be necessary.

### Undocumented Stuff

Much of Takedown runs off of config settings as it is intended to operate as declaratively as possible.  

There are many more config options not documented here, but please note that those and any other undocumented behavior/feature/bug is subject to breaking change at **any** [semver](https://semver.org) level.


## Final Notes

Originally, Takedown was built to accomodate **ACID** (Another Component Interface Documenter - not yet released) as I was unable to find a parser that fully satisfied its HTML generation needs.  As such, this tool is limited in some respects but should, with some time, become a great markdown parsing dependency for any application.

As an acknowledgement, this project was initially inspired by [this article](https://medium.com/better-programming/create-your-own-markdown-parser-bffb392a06db) during the search for the markdown parser of my dreams. :smile:

Happy Markdown Parsing!
