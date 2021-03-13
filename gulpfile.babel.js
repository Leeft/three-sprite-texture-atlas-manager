import gulp from 'gulp';
import path from 'path';
import del from 'del';
import plumber from 'gulp-plumber';
import mocha from 'gulp-mocha';
import fs from 'fs';
import eslint from 'gulp-eslint';
import jsdoc2md from 'jsdoc-to-markdown';
import debug from 'gulp-debug';
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

// Gather the library data from package.json rather than
// hardcoding the destination paths in this gulpfile.
const manifest = JSON.parse(fs.readFileSync('./package.json'));
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const es6File = manifest[ 'jsnext:main' ];
const destinationFolder = path.dirname(mainFile);
const umdExportFileName = path.basename(mainFile, path.extname(mainFile));
const es6ExportFileName = path.basename(es6File, path.extname(es6File));

// These are JS files that should be watched by Gulp. When running tests in the browser,
// watchify is used instead, so these aren't included.
const jsWatchFiles = [ 'src/**/*.js', 'test/**/*' ];
// These are files other than JS files which are to be watched. They are always watched.
const otherWatchFiles = [ 'package.json', '**/.eslintrc' ];

// Helpers

function lintFiles( files ) {
  return gulp.src(files)
    .pipe(plumber())
    .pipe(debug())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

//
// Task exports
//

// Clean

export const clean = () => del([ destinationFolder ]);

// Linting

export function lint_src() {
  return lintFiles([ 'src/**/*.js' ]);
}

export function lint_test() {
  return lintFiles([ 'test/unit/**/*.js' ]);
}

export const lint = gulp.series( lint_src, lint_test );

// Testing

export function tests() {
  return gulp.src([ 'test/unit/**/*.js' ], { read: false })
    .on('error', function(err) {
      console.log(err.message);
      this.emit('end');
    })
    .pipe(debug())
    .pipe(mocha());
}

// Linting and testing

export const test = gulp.series( lint, tests );

// Watch: Run the headless unit tests as you make changes.

export function watch() {
  const allFiles = [ jsWatchFiles, otherWatchFiles ];
  gulp.watch( allFiles.flat(), test );
}

// Coverage

//function coverage() {
//  return gulp.series( lintSrc, lintTest );
//    gulp.src([
//    [ 'lint-src', 'lint-test' ], function(done) {
//  gulp.src([ 'src/**/*.js' ])
//    .pipe(istanbul({ instrumenter: isparta.Instrumenter }))
//    .pipe(istanbul.hookRequire())
//    .on('finish', function() {
//      return test()
//        .pipe(istanbul.writeReports())
//        .on('end', done);
//    });
//}

// Docs

export function docs( done ) {
  let output = jsdoc2md.renderSync({
    files: 'src/**/*.js',
    template: fs.readFileSync( './api.hbs', 'utf8' ),
    noCache: true,
  });
  output = output.replace( /\s+$/mg, '' );
  fs.writeFileSync( './docs/API.md', output );
  return done();
}

// Bundle, build ES and UMD versions of the library

export const bundle = async () => {
  const input = 'src/texture-manager.js';
  const globals = { 'three/build/three.js': 'THREE' };
  const external = [ 'three/build/three.js' ];

  /* Build the ES* and UMD (non-minified) builds */

  const bundle = await rollup({
    input: input,
    plugins: [
      resolve(),
      babel({ babelHelpers: 'bundled' }),
    ],
    external: external,
  });

  await bundle.write({
    file: es6File,
    format: 'es',
    sourcemap: true,
    globals: globals
  });

  await bundle.write({
    file: mainFile,
    format: 'umd',
    sourcemap: true,
    name: manifest.babelBoilerplateOptions.mainVarName,
    globals: globals
  });

  /* And the minified UMD build; this is for the browser so needs to be minified for non-developer use */

  const minified = await rollup({
    input: input,
    plugins: [
      resolve(),
      babel({ babelHelpers: 'bundled' }),
      terser(),
    ],
    external: external,
  });

  await minified.write({
    file: destinationFolder + '/' + umdExportFileName + '.min.js',
    format: 'umd',
    sourcemap: true,
    name: manifest.babelBoilerplateOptions.mainVarName,
    globals: globals
  });
}

// Build - do it all

export const build = gulp.series( lint, test, clean, bundle, docs );

// Export default task
export default test;

// EOF
