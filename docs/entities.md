
> IMPORTANT!  
> The information covered in here is considered *undocumented* and subject to be changed without notice at any semver level.


# Markdown Entities

The CommonMark spec defines several "entities" that can be parsed from a markdown document.  These elements are represented in Takedown's config as the `entities` entry, and, consequently, can be modified if needed.

An entity has several properties that can be defined:

- `name` *string*: the converter name to be used
- `nestable` *array*: names of other entities that can appear as children
- `order` *number*: order in which the entity gets a chance to match a segment of the document
- `priority` *number*: used to determine the winner of a contested document segment
- `pattern` *string*: the name of the pattern that defines the behavior of the entity
- `patternData` *object*: parameters for the given `pattern`
- `delouse` *object*: settings for delousing content

Note that all of the above except `order`, `priority`, and `delouse` may depend on the `pattern` being used.

If `name` is not set, the name of the entity itself will be used, if not determined by the pattern.


## Patterns

The patterns available are based on CommonMark parsing specifications.  At this time they are in a rather rudimentary state and not yet ready to be exposed nor even documented fully.  

But here is a list of the existing patterns with a link to the spec on which they are based.

Block Patterns:
- **block-accept-lines**: (n/a)
- **block-atomic-fence**: <https://spec.commonmark.org/0.31.2/#fenced-code-blocks>
- **block-char-capture**: <https://spec.commonmark.org/0.31.2/#atx-headings>
- **block-char-container**: <https://spec.commonmark.org/0.31.2/#block-quotes>
- **block-char-divider**: <https://spec.commonmark.org/0.31.2/#thematic-breaks>
- **block-indented-content**: <https://spec.commonmark.org/0.31.2/#indented-code-blocks>
- **block-list-container**: <https://spec.commonmark.org/0.31.2/#lists>
- **block-list-item**: <https://spec.commonmark.org/0.31.2/#list-items>
- **block-pair-enclosure**: <https://spec.commonmark.org/0.31.2/#html-blocks>
- **block-paragraph-content**: <https://spec.commonmark.org/0.31.2/#paragraphs>
- **block-reference-data**: <https://spec.commonmark.org/0.31.2/#link-reference-definitions>
- **block-setext-underscore**: <https://spec.commonmark.org/0.31.2/#setext-headings>

Inline Patterns:
- **inline-atomic-segments**: <https://spec.commonmark.org/0.31.2/#raw-html>
- **inline-char-enclosure**: <https://spec.commonmark.org/0.31.2/#code-spans>
- **inline-decorate-content**: <https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis>
- **inline-email-autolink**: <https://spec.commonmark.org/0.31.2/#autolinks>
- **inline-linked-element**: <https://spec.commonmark.org/0.31.2/#links>, <https://spec.commonmark.org/0.31.2/#images>
- **inline-url-autolink**: <https://spec.commonmark.org/0.31.2/#autolinks>


## Entity List

Here are the entities that make use of the patterns above.  Please check the repo for the actual settings used.

- **`arbitag`** (block-pair-enclosure): HTML-block type 7
- **`autolink`** (inline-url-autolink): automatic link
- **`code`** (inline-char-enclosure): backtick enclosed text
- **`codeblock`** (block-indented-content): indented content
- **`divide`** (block-char-divider): thematic break
- **`email`** (inline-email-autolink): automatic email link
- **`emphasis`** (inline-decorate-content): emphasis and strong emphasis
- **`fenceblock`** (block-atomic-fence): fenced blocks
- **`header`** (block-char-capture): titular content
- **`html`** (inline-atomic-segments): inline HTML
- **`htmlblock`** (block-pair-enclosure): HTML-block types 1-6
- **`image`** ('inline-linked-element): image content
- **`linebreak`** (inline-atomic-segments): hard line break
- **`link`** ('inline-linked-element): link content 
- **`list`** (block-list-container): list container
- **`listitem`** (block-list-item): list item
- **`paragraph`** (lock-paragraph-content): general content
- **`quotation`** (block-char-container): quoted/advisory content
- **`reference`** (block-reference-data): link reference data (no output)
- **`root`** (block-accept-lines): document level entity
- **`setext`** (block-setext-underscore): titular content in setext form

The above entities correlate with the `convert` options in config with the following exceptions:

- entity `arbitag` uses the `htmlblock` converter
- entity `emphasis` may use `emphasis` or `strong` converters

See the project readme on all these for available outputs.


## Usecases

Generally, you are not going to want to mess with these parsing entities.  At least not until they become more stable and the documentation more robust.

However, a couple of potential usecases right now could be...
- changing `name` in order to use a different converter
- modifying/suppressing `delouse` settings for selected outputs
- adjusting `nestables` to change the entity's internal parsing
