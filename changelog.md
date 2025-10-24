# Takedown Change Log


## Notes

- how to make markdown entities pluggable?
- header sections


## To Dos

- add a debug mode for actionlog output
- repool agent objects after applying to parent


---
### v0.1.4

- refactor of internal entities to extract patterns
- move entities to config file
- global link refs do not overwrite document link refs
- `isref` boolean added to image and link converters for link ref definition derivations


### v0.1.3

- bug fix for `vars` config option


### v0.1.2

- added global reference links
- test page added to github pages


### v0.1.1

- github action to build and produce bundled artifacts
- fixed the test html page


### v0.1.0

- added `td.partition` function
- delouser search/replace added to configuration (undocumented)
- `id` and `meta` variables added for conversion
- `config.onAction` added for parsing step notification (undocumented)
- `config.onConvert` added for conversion notification (undocumented)
- `td.parse` allows `config` to be passed as second parameter

Breaking Changes!

- `td.parse` now returns an object with parsing details
- exports changed for CJS


### v0.0.3

- fixed bugs with extensionless imports


### v0.0.2

- readme updates ad error fixes
- package.json adds 'md' keyword


### v0.0.1

- initial release!
