var gulp = require('gulp');
var concatCss = require('gulp-concat-css');
var lazyMinify = require('gulp-lazy-minify');
//var ejsmin = require('gulp-ejsmin');
var uglyfly = require('gulp-uglyfly');
var concat = require('gulp-concat');
var vulcanize = require('gulp-vulcanize');
var clean = require('gulp-clean');
var gulpCopy = require('gulp-copy');
var crisper = require('gulp-crisper');

gulp.task('default', ['clean','copy-dependencies','editor-js-concat','editor-css-concat','vul']);
gulp.task('clean', function () {
	return gulp.src(['bower_components/dist',
	                 'bower_components/resource/javascripts/editor_js.js', 
	                 'bower_components/resources/stylesheets/editor_dep.css'], {read: false})
		.pipe(clean());
});


gulp.task('editor-js-concat',['clean'], function () {
	return gulp.src(
			['bower_components/resources/javascripts/prism/prism.js',
			 'bower_components/resources/javascripts/medium-editor.min.js',
			 'bower_components/resources/javascripts/handlebars.runtime-v4.0.5.js',
			 'bower_components/resources/javascripts/jquery-sortable.min.js',
			 'bower_components/resources/javascripts/jquery.ui.widget.js',
			 'bower_components/resources/javascripts/jquery.iframe-transport.js',
			 'bower_components/resources/javascripts/jquery.fileupload.js',
			 'bower_components/resources/javascripts/medium-editor-insert-plugin.js',
			 'bower_components/resources/javascripts/medium-editor-tables.min.js',
			 'bower_components/resources/javascripts/MediumButton.min.js'])
			 .pipe(concat("/editor_js.js"))
			 .pipe(uglyfly())
			 .pipe(gulp.dest('bower_components/dist/resources/javascripts'))
			 //.pipe(gulp.dest('bower_components/resources/javascripts'))
			 .on("error", errorAlert);
});

gulp.task('editor-css-concat',['clean'], function () {
   return gulp.src(
		  ['bower_components/resources/stylesheets/demo.css',
			  'bower_components/resources/stylesheets/prism/prism.css',
			  'bower_components/resources/stylesheets/medium-editor.min.css',
			  'bower_components/resources/stylesheets/medium-editor-tables.min.css',
			  'bower_components/resources/stylesheets/themes/beagle.css',
			  'bower_components/resources/stylesheets/medium-editor-insert-plugin.min.css',
			  'bower_components/paper-styles/demo.css'])
    .pipe(concatCss("/editor_dep.css"))
    .pipe(lazyMinify())
    .pipe(gulp.dest('bower_components/dist/resources/stylesheets'));
    //.pipe(gulp.dest('bower_components/resources/stylesheets'));
});

gulp.task('vul', function () {
    return gulp.src(['bower_components/citi-components/home_imports.html',
                     'bower_components/citi-components/editor_imports.html',
                     'bower_components/citi-components/citi-doc-home-page.html',
                     'bower_components/citi-components/citi-doc-editor.html'])
                     .pipe(vulcanize({
                    	 abspath: '',
                    	 excludes: [],
                    	 stripExcludes: false,
                    	 stripComments: true,
                    	 inlineScript: true
                    	 
                     })).pipe(crisper()).on("error", errorAlert).pipe(gulp.dest('bower_components/dist/citi-components'));
});
gulp.task('copy-dependencies', ['clean'], function () {
	gulp.src('bower_components/web-animations-js/*.*')
	 .pipe(gulp.dest('bower_components/dist/web-animations-js'));
	gulp.src('bower_components/webcomponentsjs/*.*')
    .pipe(gulp.dest('bower_components/dist/webcomponentsjs'));
	gulp.src(['bower_components/promise-polyfill/*.*','bower_components/promise-polyfill/*.html'])
	.pipe(gulp.dest('bower_components/dist/promise-polyfill'));
	gulp.src(['bower_components/paper-styles/demo.css'])
	.pipe(gulp.dest('bower_components/dist/paper-styles'));
});

function errorAlert(err) {
	console.log(err.toString());
	this.emit("end");
}
/*gulp editor-js-concat 
gulp editor-css-concat
gulp editor-css-concat editor-css-min vul
*/


 
