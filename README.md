# Snahpify

A userscript to help you easily generate a pretty Snahp post and accelerate your Snahp post workflow :)

This is a fork of [Snahp OMDB Template Generator](https://github.com/Bilibox/Snahp-Template-Generators/tree/Omdb) but with some major changes and new features:

- Automatically generate your post Subject from just your mediainfo (like so `[HOST 1]...[HOST N] Clean File Title [SIZE]`)
- Since it can parse the title from the mediainfo, it can also automatically trigger the Snahp IMDb widget search with it so you can quickly insert the built-in Snahp IMDb widget into the post (so no OMDB API key required)
- Snahpify appropriately formats your links:
  - MEGA
  - ZS
  - GDRIVE
- Snahpify directly integrates the Snahp Link Protector so it can automatically convert your links into protected snahp links and even set a password and show a hint
- Snahpify directly integrates Base64 encoding so it can automatically encode your links any number of times (e.g. double encode, triple encode,...). For multiple iterations, it automatically specifies the number of iterations in the generated post. If used, a base64 decode site (https://base64.io) is also linked to.
- Snahpify enables you to combine both Link Protection measures: Base64 encode all your links (any number of times) and then automatically convert them into protected snahp links (even set a password) for extra security
- Snahpify generates and formats your screenshots
- Snahpify simplifies adding a post banner image




## Installation

Set it up in just 2 simple steps:

1. Install the browser extension for an _userscript manager_ (like [Tampermonkey](https://www.tampermonkey.net/))
2. Go to https://github.com/3ncod3/snahpify/raw/main/script.user.js and hit the 'Install' button


## Development

Anyone is welcome to contribute by sending in PRs!

To contribute, you just need to know some JavaScript and the [Geasemonkey docs](https://wiki.greasespot.net/Greasemonkey_Manual)

Suggestions and improvements are also very welcome!

## License

MIT :)