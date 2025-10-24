
# Delousers

"Delousers" are reusable bits of code that remove, replace, or insert characters found in the markdown to support a given document format.  For example, when converting from markdown to HTML, it is necessary to convert HTML entities into actual display characters for the browser.

Here we will cover the delousers used to comply with the CommonMark spec for HTML generation.  They are loaded into the config as `delousers` by default and, consequently, can be modified if needed.


## Formats

A delouser can come in one of two forms.


### object form (defined)

In the object form, a delouser has `search` and `replace` properties.

```js
encodeUriChars: { search: [ '(?<cap>[^%\\w]+)', 'g' ], replace: res => encodeURI(res.cap) }
```

These are used as first and second parameters to `String.prototype.replace`, respectively.

However...

The `search` parameter is always converted into a regular expression, so proper escaping will be necessary in a string.  An array value will be used as parameters for `new RegExp()`.

If `replace` is a function then parameter passed is an object with the following properties:
- `match`: the matched substring
- `caps`: array of captured groups
- `offset`: index of matched substring
- `string`: the string being examined

In additional, all named capture groups will be spread into the object parameter *after* the above values, so take care not to use group names that may overwrite them... unless you don't need that data anyway, of course.


### array form (combined)

The array delouser form is merely a list of the names of delousers to use, in the order specified.  This is recursive as other array form delousers can be referenced as well.

```js
common: [ 'htmlEntsToChars', 'unescapePunct', 'commonHtmlEnts' ]
```

Only strings are allowed in the array.  An object form delouser cannot be defined there.


## Defined Delousers

Below are the object-form defined delousers.


### `ampersandToEnt`

Replaces ampersand characters (`&`) with `&amp;` where not appearing as `&amp;`, `&quot;`, `&lt;`, or `&gt;`.


### `commonCharToEnt`

Converts:
- `<` to `&lt;`
- `>` to `&gt;`
- `"` to `&quot;`


### `unescapePunct`

Removes backslashes that immediately precede ASCII punctuation characters.


### `namedEntToChar`

Converts unescaped HTML entity references to their unicode code-points.  The entity reference remains intact if it cannot be converted.


### `decimalEntToChar`

Converts unescaped decimal entity references to their unicode code-points using `String.fromCharCode()`.


### `hexEntToChar`

Converts unescaped decimal entity references to their unicode code-points using `String.fromCharCode()`.


### `lineEndToSpace`

Converts line ending characters (U+000A, U+000D, newline) to a space character.


### `encodeUriChars`

Uses `encodeURI` to encode any character that is not a percent sign (`%`) or a word character (numbers, letters, underscores).


### `trimEnd`

Removes all whitespace at the end of a string.


### `trimEncSpace`

Trims exactly one space character from both ends of a string.  That is to say, nothing changes if there is not at least one space at each end of the string.


### `trimAroundNewline`

Clears all whitespace before and after a newline character.  The general effect is to collapse blank lines into a single newline.


## Combined Delousers

Below is the list of the combo-delousers (array form).

- `common`: `htmlEntsToChars`, `unescapePunct`, `commonHtmlEnts`
- `commonHtmlEnts`: `ampersandToEnt`, `commonCharToEnt`
- `htmlEntsToChars`: `namedEntToChar`, `decimalEntToChar`, `hexEntToChar`
- `uri`: `htmlEntsToChars`, `unescapePunct`, `encodeUriChars`, `commonHtmlEnts`
