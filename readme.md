
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
let takedown = require('takedown/cjs').default
```

and then...

```js
let markdown = 'Your markdown *here*!';
// create an "instance"
let td = takedown();
// make some HTML!
let html = td.parse(markdown).doc;
// => <p>Your markdown <em>here</em>!</p>
```

Simple!


## What's the API here?

The following sections detail the api for a takedown parser instance.

```js
let td = takedown();
```

### `td.clone(config: object): object`

Returns a copy of the Takedown instance, optionally merging `config` atop the current configuration.


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

All the config options are detailed later in this document.


### `td.parse(markdown: string, config: object): object`

Where all the magic happens - takes `markdown` and converts it to HTML (or whatever document structure is configured).

Use `config` to set local options that will be merged atop current instance defaults.

```js
let html = td.parse('Welcome to **Takedown**!').doc;
// => <p>Welcome to <strong>Takedown</strong>!</p>
```

The returned object will have
- `doc`: the document produced by the converters
- `source`: the original markdown provided (almost - see below)
- `matter`: parsed front-matter (if `fm.enabled` and present in document)
- `meta`: data accumulated from the parsing process

Metadata (`meta`) will include:
- `id`: unique timestamp-based hex value for the document
- `refs`: link reference data parsed from the document

> Note that `source` might be slightly different than the original `markdown` provided due to the removal of insecure characters (U+0000) and the replacement of structural tab characters with spaces.


### `td.parseMeta(markdown: string, fm: object): object`

Gets front-matter from a document as object data.  Returns `undefined` if `fm.enabled` is `false`.

Use `fm` to set local options that will be merged atop `config.fm` instance defaults.

```js
td.config.fm.enabled = true;
// front-matter is parsed as JSON by default
let fm = td.parseMeta(markdown);
```

See the `fm` config option for more details on how front-matter is handled.


### `td.partition(markdown: string, fm: object): array`

Returns unparsed markdown content and front matter as separated via `fm.capture` in an array.

Use `fm` to set local options that will be merged atop `config.fm` instance defaults.

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

When not `fm.enabled`, `matter` is `undefined` and `source` is returned as-is.


## What are the config options?

### `convert`

Strings and/or functions that specify how markdown entities are converted to document structure. 

A string will be interpolated using insertion variables (as per *What is \"string conversion\"?* section below).

A function should be of the form `(data: object, vars: object): string` where
- `data` contains converter insertion variables, and
- `vars` are the configured variables (see `vars` config option)

Strings returned from converter functions will also be interpolated.

Here are the defaults with insertion variable names explained:

```js
convert:
{
    /*
        Automatic hyperlink (inline).

        value - display URL
        url - encoded URL
    */
    autolink: '<a href="{url}">{value}</a>',
    /*
        Code span (inline).

        value - inline code text
        ticks - opening ticks
    */
    code: '<code>{value}</code>',
    /*
        Indented code block (block).

        value - code block source
    */
    codeblock: '<pre><code>{value}</code></pre>\n',
    /*
        Thematic break (block).

        marks - symbols used for break
    */
    divide: '<hr />\n',
    /*
        Email address (inline).

        value - email address
        email - email address
    */
    email: '<a href="mailto:{email}">{value}</a>',
    /*
        Emphasis (inline).

        value - emphasis text
        child - child data
    */
    emphasis: '<em>{value}</em>',
    /*
        Fenced code block (block).

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
        ATX Header (block).

        value - header tag content
        level - header level (1-6)
        child - child data
    */
    header: '<h{level}>{value}</h{level}>\n',
    /*
        HTML (inline).

        value - inline html content
    */
    html: '{value}',
    /*
        HTML block (block).

        value - block html content
    */
    htmlblock: '{value}',
    /*
        Image (inline).

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
        Hard line break (inline).

        nada.
    */
    linebreak: '<br />',
    /*
        Hyperlink (inline).

        value - link text
        href - encoded link URL
        title - link description
        child - child data
    */
    link: '<a href="{href??}"{? title="{title}"?}>{value}</a>',
    /*
        List item (block).

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
        Ordered list (block).

        value - list content
        start - starting index
        tight - should paragraphs be suppressed?
        child - child data
    */
    olist: e => `<ol${e.start !== 1 ? ` start="${e.start}"` : ''}>\n{value}</ol>\n`,
    /*
        Paragraph (block).

        value - paragraph content
        child - child data
    */
    paragraph: ({ parent: p, index }) => 
        p.tight ? '{value}' + (p.child.count - 1 === index ? '' : '\n') : '<p>{value}</p>\n',
    /*
        Blockquote (block).

        value - block quote content
        child - child data
    */
    quotation: '<blockquote>\n{value}</blockquote>\n',
    /*
        Document root (block).

        value - entire document output
        child - child data
    */
    root: '{value}',
    /*
        Setext Header (block).

        value - setext header tag content
        level - setext header level (1-2)
        child - child data
    */
    setext: '<h{level}>{value}</h{level}>\n',
    /*
        Strong emphasis (inline).

        value - strong emphasis text
        child - child data
    */
    strong: '<strong>{value}</strong>',
    /*
        Unordered list (block).

        value - list content
        tight - should paragraphs be suppressed?
        child - child data
    */
    ulist: '<ul>\n{value}</ul>\n'
}
```

**All** of the target document structure is defined in the `convert` settings.

Use only `{value}` to render unstructured.

```js
// no header tags!
td.config.convert = { header: '{value}' }
```

Omit `{value}` to suppress descendant output.

```js
// no header content!
td.config.convert = { header: '<h{level}></h{level}>\n' }
```

Set to `null` or empty string to turn off output completely.

```js
// no more headers!
td.config.convert = { header: null }
```

Where the `child` insertion variable is available, it will be an object having
- `count`: number of child entities (including text nodes)
- `first`: converter name of the first child (or "text" for text node)
- `last`: converter name of the last child (or "text" for text node)

Some additional variables are also available for every converter.
- `name`: the converter name
- `id`: unique timestamp-based hex value for entity
- `meta`: the same object returned from `td.parse`
- `parent`: parent converter's insertion variables (excluding `value`)
- `index`: 0-based position in the parent converter

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
  Content from `capture` is passed to this function.  It should return an object with parsed data or a nullish value.

- **`useConfig`** (*boolean|string*) \
  Names a key in front-matter containing additional config options for the document.  These options will be merged atop instance defaults and any manually set options (including those passed to `td.parse`).  
  
  Set to `true` to indicate the front-matter itself *is* config options.  Use `false` to turn this off completely.

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

**Dynamic Variables** \
To make a "dynamic" variable, use a function.  Functions will be called with the current converter's insertion variables in string conversion.  Functional converters will have to invoke a function variable directly.


## What is "string conversion"?

It is how strings are interpolated with insertion variables.

There are two facets here:

- **variables** \
  To insert a variable into a string, use `{name}`, where `name` is the name of the variable to be inserted.  If the replacement value is `null` or `undefined`, no replacement is made and the string remains as-is.  Only letters, numbers, underscores, and periods are valid characters for `name`.

  To ensure replacement, use `{name??text}` syntax where `text` is the literal value to use when `name` is nullish.

  If a `name` is found in both entity data and `vars`, it is the entity data value that will be used in string conversion.  A conversion function would need to be used in order to see both values.

- **segments** \
  Use `{?content?}` syntax to identify an optional portion (segment) of the string where `content` will only be rendered if at least one internal variable is replaced.  That is, if variable replacement within `content` results in the exact same string, the entire segment will be omitted.  

  Nested segments are processed inside-out, with the results of inner segments constituting the initial state of outer ones.


## Got any usage tips?

Yes!

### Local Insertion Variables

The string returned from a function converter also gets interpolated for variables and segments.  In the function,  properties can be added to `data` (first parameter) and those will also be available for interpolation.

### Metadata Accumulator

Use `data.meta` object in a function converter to capture information across the parsing run.  It could be used by the header converter to build a TOC for the document, for example. 

### Configure Efficiently

A configuration change on an instance (`td`) causes it to internally be flagged to be "rebuilt" on the next `parse` call.

When converting lots of documents with distinct configuration needs, it will be more performant to configure a separate instance for each document group rather than configuring a single instance on a per-document basis. 

Internally, when options are passed directly to an instance method, or when front-matter is allowed to inform the configuration, the instance is cloned before parsing begins, and this can have the same potential performance hit.

Hopefully, this can be mitigated somewhat in a future release :wink:


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

There are many config options not documented here, but please note that those and any other undocumented behavior/feature/bug is subject to breaking change at **any** [semver](https://semver.org) level.


## Final Notes

Originally, Takedown was built to accomodate **ACID** (Another Component Interface Documenter - not yet released) as I was unable to find a parser that fully satisfied its HTML generation needs.  As such, this tool is limited in some respects but should, with some time, become a great markdown parsing dependency for any application.

As an acknowledgement, this project was initially inspired by [this article](https://medium.com/better-programming/create-your-own-markdown-parser-bffb392a06db) during the search for the markdown parser of my dreams. :smile:

Happy Markdown Parsing!
