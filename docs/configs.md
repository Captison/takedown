
> IMPORTANT!  
> The information covered in here is considered *undocumented* and subject to be changed without notice at any semver level.


# Additional Config Options

This file describes features and config options that are not officially part of the Takedown documentation and may not even work as described (or even be implemented yet).


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

This value does not affect the way spacing itself is interpreted by the parser, so changing this value can drastically change the way the parser interprets document structure. 

Default:

```js
tabSize: 4
```


## `onAction`

Sets a function that is called for every parsing step.

The "listener" function will receive an object with:
- `action`: name of current step
- `entity`: current entity id, name, and type
- `parent`: parent id, name, and type
- `chunk`: target segment being evaluated in this step
- `index`: index of target segment


## `onConvert`

Sets a function that is called after every conversion.  

The "listener" function will receive an object with:
- `data`: entity variable data
- `output`: output from the converter


# Command Line Interface

There is a very limited CLI included called `td`.  

It currently accepts only an input file and an output file and does not allow for configuration.

```shell
> td path/to/source.md path/to/target.html
```

This will be updated to be more extensive in the future.
