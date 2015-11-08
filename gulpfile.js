// Load Gulp and all of our Gulp plugins
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

// Load other npm modules
const del = require('del');
const glob = require('glob');
const path = require('path');
const isparta = require('isparta');
const babelify = require('babelify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const rollup = require('rollup');
const source = require('vinyl-source-stream');

// Gather the library data from `package.json`
const manifest = require('./package.json');
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const es6File = manifest[ 'jsnext:main' ];
const destinationFolder = path.dirname(mainFile);
const umdExportFileName = path.basename(mainFile, path.extname(mainFile));
const es6ExportFileName = path.basename(es6File, path.extname(es6File));

// For gulp-jsdoc-to-markdown
// https://github.com/jsdoc2md/gulp-jsdoc-to-markdown
const fs = require('fs');
const gutil = require('gulp-util');
const gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
const rename = require('gulp-rename');
const concat = require('gulp-concat');

// Remove the built files
gulp.task('clean', function(cb) {
  del([ destinationFolder ]).then( function() {
    cb()
  });
});

// Remove our temporary files
gulp.task('clean-tmp', function(cb) {
  del([ 'tmp' ]).then( function() {
    cb()
  });
});

// Send a notification when JSCS fails,
// so that you know your changes didn't build
function jscsNotify(file) {
  if (!file.jscs) { return; }
  return file.jscs.success ? false : 'JSCS failed';
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe($.plumber())
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failOnError())
      .pipe($.jscs())
      .pipe($.notify(jscsNotify));
  });
}

// Lint our source code
createLintTask('lint-src', [ 'src/**/*.js' ]);

// Lint our test code
createLintTask('lint-test', [ 'test/**/*.js' ]);

// Build N versions of the library
gulp.task('build', [ 'lint-src', 'clean', 'docs' ], function(done) {
  rollup.rollup({
    entry: 'src/texture-manager.js',
  }).then( function ( bundle ) {
    // Create the umd files
    var umd = bundle.generate({
      format: 'umd',
      exports: 'default',
      moduleName: config.mainVarName,
      globals: {
        three: 'THREE',
      },
    });

    $.file( umdExportFileName+'.js', umd.code, { src: true } )
      .pipe($.plumber())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.babel())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .pipe($.filter([ '*', '!**/*.js.map' ]))
      .pipe($.rename(umdExportFileName + '.min.js'))
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.uglify())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .on('end', done);

    // And create an .es6.js for easy inclusion in modern build pipelines
    bundle.write({
      dest: destinationFolder+'/'+es6ExportFileName+'.js',
      format: 'es6',
      exports: 'named',
      moduleName: config.mainVarName,
    });
  })
  .catch(done);
});

function bundle(bundler) {
  return bundler.bundle()
    .on('error', function(err) {
      console.log(err.message);
      this.emit('end');
    })
    .pipe($.plumber())
    .pipe(source('./tmp/__spec-build.js'))
    .pipe(buffer())
    .pipe(gulp.dest(''))
    .pipe($.livereload());
}

function test() {
  return gulp.src([ 'test/setup/node.js', 'test/unit/**/*.js' ], { read: false })
    .pipe($.mocha({ reporter: 'spec', globals: config.mochaGlobals }));
}

gulp.task('coverage', [ 'lint-src', 'lint-test' ], function(done) {
  require('babel-core/register');
  gulp.src([ 'src/**/*.js' ])
    .pipe($.istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
});

// Lint and run our tests
gulp.task('test', [ 'lint-src', 'lint-test' ], function() {
  require('babel-core/register');
  return test();
});

// These are JS files that should be watched by Gulp. When running tests in the browser,
// watchify is used instead, so these aren't included.
const jsWatchFiles = [ 'src/**/*', 'test/**/*' ];
// These are files other than JS files which are to be watched. They are always watched.
const otherWatchFiles = [ 'package.json', '**/.eslintrc', '.jscsrc' ];

// Run the headless unit tests as you make changes.
gulp.task('watch', function() {
  const watchFiles = jsWatchFiles.concat(otherWatchFiles);
  gulp.watch(watchFiles, [ 'test' ]);
});

// One markdown file out per source file in
//gulp.task( 'docs', function() {
//  return gulp.src( 'src/**/*.js' )
//    .pipe( gulpJsdoc2md({ template: fs.readFileSync( './template.hbs', 'utf8' ) }) )
//    .on( 'error', function( err ) {
//      gutil.log( gutil.colors.red('jsdoc2md failed'), err.message );
//    })
//    .pipe( rename( function( path ) {
//      path.extname = '.md';
//    }))
//    .pipe( gulp.dest( 'docs' ) );
//});

// Multiple source files in, a single markdown file out
gulp.task( 'docs', function() {
  return gulp.src( 'src/**/*.js' )
  .pipe( concat('API.md') )
  .pipe( gulpJsdoc2md({
    separators: true,
    //'module-index-format': 'grouped',
    //'global-index-format': 'grouped',
    //'param-list-format': 'list',
    //'property-list-format': 'list',
    template: fs.readFileSync( './api.hbs', 'utf8' ) }) )
  .on( 'error', function( err ) {
    gutil.log( gutil.colors.red('jsdoc2md failed'), err.message );
  })
  .pipe( gulp.dest( 'docs' ) );
});

// An alias of test
gulp.task('default', [ 'test' ]);
