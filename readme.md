
# Takedown

A markdown parser that gives you control of the output document structure.


## How do I use this?

```shell
> npm install takedown --save
```

and then...

```js
import takedown from 'takedown'

// create "instance" with configuration
let td = takedown({ ... });

let markdown = 'Your markdown *here*!';

// make some HTML!
let html = td.parse(markdown);
// => <p>Your markdown <em>here</em>!</p>

// get front-matter!
let fm = td.parseMeta(markdown);
```

Simple!

## How do I configure this?

As seen above, configuration can be set when creating a parser instance.

```js
let quotation = '<div class="blockquote">{value}</div>';

let td = takedown({ convert: { quotation } });
```

But it can also be updated directly on the instance.

```js
td.config = { convert: { quotation } };
// or
td.config.convert = { quotation };
// or
td.config.convert.quotation = quotation;
```

All of the update methods above have the same effect (i.e., only `config.convert.quotation` setting is affected and previous defaults/changes remain in place).  Errors are thrown for bad config settings.

### Config Options

#### `convert`

Specifies how to have markdown entities converted. 

Each converter can be either a string or a function.

Strings can be interpolated using insertion variables and `vars` (as per `Converter String Replacement` section below).

Functions will receive insertion variables and `vars` as two separate parameters and the returned string will also be interpolated.

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
    fenceblock: v =>
    {
        v.lang = v.info?.match(/^\s*([^\s]+).*$/s)?.[1];
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
        value - image description
        href - encoded image URL
        title - image description
        child - child data
    */
    image: v =>
    {
        v.alt = v.value.replace(/<[^>]+?(?:alt="(.*?)"[^>]+?>|>)/ig, '$1');
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
    listitem: v =>
    {
        v.nl = v.child.count && (!v.tight || v.child.first !== 'paragraph') ? '\n' : '';
        return '<li>{nl}{value}</li>\n';
    },
    /*
        value - list content
        start - starting index
        tight - should paragraphs be suppressed?
        child - child data
    */
    olist: v => `<ol${v.start !== 1 ? ` start="${v.start}"` : ''}>\n{value}</ol>\n`,
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

**All** of the target document structure is defined in the `convert` settings.  Omit `{value}` from a converter to suppress descendant output.  Set it to to `null` to turn off its output completely.

The `child` insertion variable is available only on parseable entities. It will have
- `count`: number of child entities (including text nodes)
- `first`: converter name of the first child (or `text` for text node)
- `last`: converter name of the last child (or `text` for text node)

A couple of additional variables are also available on every entity (except `root`).
- `parent`: object with insertion data (excluding `value`) from the parent converter
- `index`: numeric position of the entity in the parent converter


##### Converter String Replacement

Remember that the below details also apply to a string returned from a converter function.

**`variables`** \
To insert a variable into a converter string, use `{name}`, where `name` is the name of the variable to be inserted.  If the replacement value is "nullish" or non-existent, no replacement is made and the data remains as-is.  Only letters, numbers, underscores, and periods are valid characters for `name`.

Use the `{name??value}` syntax where `value` is the literal value to use when `name` is nullish.

**`segments`** \
To make a segment of a converter string optional, enclose it using `{?content?}` where `content` is the portion of the string that will only be rendered if at least one internal variable is replaced.  More directly, if variable replacement within a segment string results in the exact same string, the entire segment will be omitted.  

Segments can be nested, but their behavior is not recursive.  Inner segments are processed first, and their results constitute the initial state of outer segments.

#### `fm`

Settings for handling markdown front-matter.

Here are the defaults:

```js
fm:
{
    capture: /^---\s*\n(?<fm>.*?)\n---\s*/s,
    parser: source => JSON.parse(source),
    useConfig: false
}
```

**`capture`** \
Defines a regular expression used to capture front-matter from a markdown document.   Take note of the `<fm>` capture group as its contents will be passed to the `parser` function.  Set to `null` to turn front-matter off completely.

**`parser`** \
Specifies the function that will parse front-matter.

**`useConfig`** \
When set to `true` Takedown will look for a `takedown` key in a document's front-matter.  The options found there will be merged atop defaults and any manually set options for that document.

> When `capture` is set to `null`, `td.parseMeta` will return `undefined`, and `td.parse` will assume everything in the document is markdown.

---

So... for simplicity, the default front-matter format is JSON. 

Yes, I know. I can hear you YAMLing... here you go:

```shell
> npm install yaml --save
```

and then...

```js
import takedown from 'takedown'
import { parse } from 'yaml'

let td = takedown({ fm: { parser: parse } });

export default td
```

#### `vars`

Variables to be used in conversion strings or passed to a conversion function.

The names here should include word-only (letters, numbers, and underscores) characters.  You can also use objects here to nest variables and then use dot-notation to access them in string conversion.

To make a "dynamic" variable, use a function.  Functions will be called with the current entity conversion data object with the return value used as the variable value.

> NOTE: Function variables are not pre-called for convert functions.  Convert functions will need to get the value manually.

Remember that variables directly associated with a given `convert` setting will take precedence over settings here.

There are no default `vars`, but here's a shameless example.

```js
td.config.convert = { emphasis: '<em>I gotta tell you {something}!</em>' };
td.config.vars = { something: 'Takedown rules' };
```


## What else do I need to know?

### CommonMark

While highly configurable, Takedown out-of-the-box is [CommonMark](https://spec.commonmark.org) spec compliant as per version **0.31.2**.  It is pure vanilla and also does not add anything to the spec (except front-matter, I guess).  

There are extra steps taken in the default `convert` settings (mostly concerning the placement of newlines) to get the output just right for matching the CommonMark test-cases, but these have no effect on the semantic correctness of the html output.

### HTML

Takedown does not generate complete HTML documents by default as it only concerns itself with generating the markup needed to represent the markdown content provided.  

Config the below or something similar if you need a full HTML document.

```js
convert:
{
    root: '<html><head><title>Takedown Document</title></head><body>{value}</body></html>'
}
```

### Test

To run tests, do

```shell
> npm test
```

This executes the default parser configuration against the [test-cases](https://spec.commonmark.org/0.31.2/spec.json).

### Undocumented Stuff

Much of Takedown runs off of config settings as it is intended to operate as declaratively as possible.

As I'm sure you will discover, there are options in the config that are not documented here.  These options may be changed completely or removed entirely in the future.  Please note that anything not documented here is subject to breaking change at **any** semver level.


## Final Notes

Originally, Takedown was built to accomodate **ACID** (Another Component Interface Documenter - not yet released) as I was unable to find a parser that fully satisfied its HTML generation needs.  As such, this tool is limited in some respects but should, with some time, become a viable markdown parsing option for any application.

As an acknowledgement, this project was initially inspired by [this article](https://medium.com/better-programming/create-your-own-markdown-parser-bffb392a06db) during the search for the markdown parser of my dreams. :smile:

Happy Markdown Parsing!
