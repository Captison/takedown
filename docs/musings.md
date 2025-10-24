

# Musings

This file includes random thoughts (or sloppy brain farts) on the future of Takedown.  Nothing here will necessary be implemented or even make sense.  This document may or may not even get updated again.


## Extensions

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


### Header Sections

Headers (h1, h2, ...etc) introduce sections of a document and are generally considered to continue until the next header of the same or higher level occurs.  

But could a "header section" also be cut off by a thematic break?

For instance, the following markdown:

```md
This content has no level.
# Header One
This content is in level 1.
## Header One One
This content is in level 1-1.
---
This content is in level 1.
## Header One Two
This content is in level 1-2.
## Header One Two One
This content is in level 1-2-1.
---
This content is in level 1-2.
## Header Two
This content is in level 2.
---
This content has no level.
# Header Three
This content is in level 3.
```

Could be rendered as

```html
This content has no level.
<section>
  <h1>Header One</h1>
  This content is in level 1.
  <section>
    <h2>Header One One</h2>
    This content is in level 1-1.
  </section>
  This content is in level 1.
  <section>
    <h2>Header One Two</h2>
    This content is in level 1-2.
    <section>
      <h3>Header One Two One</h3>
      This content is in level 1-2-1.
    </section>
    This content is in level 1-2.
  </section>
</section>
<section>
  <h1>Header Two</h1>
  This content is in level 2.
</section>
This content has no level.
<section>
  <h1>Header Three</h1>
  This content is in level 3.
</section>
```

Obviously, a thematic break would have to be recognized as ending a header section and have its output suppressed.  

But perhaps there needs to be different block markers used altogether???
