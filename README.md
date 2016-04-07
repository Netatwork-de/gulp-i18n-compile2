gulp-i18n-compile2
===
[![NPM version][npm-image]][npm-url] 

This gulp tasks compiles the extract content from gulp-i18n-extract into language json files for [Aurelia-i18n][Aurelia-i18n-url] .

This task ist part of the i18n toolchain:
1. [Tag](to be implemented) text nodes in HTML with an i18n key attribute
2. [Extract][extract] keys and values
3. Translate
4. Compile into language files for i18n like [Aurelia-i18n][Aurelia-i18n-url]

## Installation

Install `gulp-i18n-compile2` using npm into your local repository.

```bash
npm install gulp-i18n-compile2 --save-dev
```
## Usage

Setup a gulp task `i18n-compile`.

```js
var gulp = require('gulp');
var i18n_compile = require('gulp-i18n-compile2');

var options = {
	fileName: "translation.json",
	defaultLanguage: "en"
};

gulp.task('i18n-compile', function() {
  return gulp.src("lang/language.json")
             .pipe(i18n_compile(options))
             .pipe(gulp.dest("./locales"));
});
```

# License

[Apache 2.0](/license.txt)

[npm-url]: https://npmjs.org/package/gulp-i18n-compile2
[npm-image]: http://img.shields.io/npm/v/gulp-i18n-compile2.svg
[extract]: https://github.com/netatwork-de/gulp-i18n-extract
[Aurelia-i18n-url]: https://github.com/aurelia/i18n
