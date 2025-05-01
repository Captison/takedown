
# Undocumented

This file describes features and configs that are not officially part of the Takedown documentation and may not even work properly (or even be explained properly).

Everything here is subject to change (or removal) in future revisions, regardless of semver version level.


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

```

For the `value` insertion variable, delousers are applied to each text node within rather than the entire string.
