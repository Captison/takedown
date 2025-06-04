# Takedown Change Log


## Notes

- how to make markdown entities pluggable?
- header sections


## To Dos

- add a debug mode for actionlog output
- repool agent objects after applying to parent


---
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
