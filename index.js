'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');

var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function(options) {
	
	if(!options) {
		options = {};
	}
	
	let outputFileName = options.fileName || "translation.json";
			
	let defaultLanguageName = options.defaultLanguage || "en";
    let defaultLanguage = {};
    let languages = {};
    
    let cwd = null;
    let fileName = null;
    let anyFileProcessed = false;
	
	function AddTranslation(languageContent, key, value, context) {
		if(!value) return;
		
		var content = languageContent;
		let objectPath = key.split('.');
		let finalPathPart = objectPath[objectPath.length-1];
		
		for(let i = 0; i<objectPath.length-1; i++) {
			let pathPart = objectPath[i];
			if(!content[pathPart]) content[pathPart] = {};
			
			content = content[pathPart];
		}
		
		if(content[finalPathPart]) {
			context.emit('warning', new PluginError('gulp-i18n-compile2',  "'Duplicate key '" + key + "' found. Content has been overwritten."));			
		}
		
		content[finalPathPart] = value;		
	}
    
    function bufferContents(file, enc, cb) {	
        		
		if (file.isNull()) {
			cb();
			return;
		}

		if (file.isStream()) {
			this.emit('error', new PluginError('gulp-i18n-compile2',  'Streaming not supported'));
			cb();
			return;
		} 
        
        let translations = JSON.parse(file.contents);
        if(!translations) {
			this.emit('error', new PluginError('gulp-i18n-compile2',  'Cannot read file ' + path.basename(file.path)));
			cb();
			return;            
        }
        		
		if(!anyFileProcessed) { // only on first execution
            anyFileProcessed = true;
			cwd = file.cwd;					
		}	
        
        for(let sourceFile in translations) {
			var source = translations[sourceFile];
            for(let i18nKey in source.content) {
                
                let extract = source.content[i18nKey];
                AddTranslation(defaultLanguage, i18nKey,extract.content, this);
                
                for(let language in extract.translations) {
                    let translation = extract.translations[language];
                    
                    let languageContent = languages[language];
                    if(!languageContent) {
                        languageContent = {};
                        languages[language] = languageContent;                        
                    }
                    
                    AddTranslation(languageContent, i18nKey,translation.content, this);                    
                }
            }
        }
            
        cb();        
    }
	
	function createFile(language, content) {		
		return new File(
		{
			base: cwd,
			path: path.resolve(cwd, "./" + language + "/" + outputFileName), 
			cwd: cwd,
			contents: new Buffer(JSON.stringify(content, null, '\t'))
		});
	}

	function endStream(cb) {   
		
		if(!anyFileProcessed) { // only on first execution
			this.emit('error', new PluginError('gulp-i18n-compile2',  'Pipeline is empty. No output has been created.'));
			cb();
			return;
		}
		
        this.push(createFile(defaultLanguageName,defaultLanguage));
			     
		for(let languageName in languages) {       
                 
            let content = languages[languageName];            
            // Add default language for missing translations
            content = Object.assign(defaultLanguage, content);
            
            this.push(createFile(languageName,content));
        }
		
		cb();
	}
    
	return through.obj(bufferContents, endStream);
}