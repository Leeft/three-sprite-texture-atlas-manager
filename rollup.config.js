import fs from 'fs';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const manifest = JSON.parse(fs.readFileSync('./package.json'));
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const es6File = manifest[ 'jsnext:main' ];
const destinationFolder = path.dirname(mainFile);
const umdExportFileName = path.basename(mainFile, path.extname(mainFile));
const es6ExportFileName = path.basename(es6File, path.extname(es6File));

const input = 'src/three-sprite-texture-atlas-manager.js';
const globals = { 'three/build/three.js': 'THREE' };
const external = [ 'three/build/three.js' ];

export default [
  {
    input: input,
    external: external,
    plugins: [
      resolve(),
      babel({ babelHelpers: 'bundled' })
    ],
    output: [
      {
        file: es6File,
        format: 'es',
        sourcemap: true,
        globals: globals,
      },
      {
        file: mainFile,
        format: 'umd',
        sourcemap: true,
        globals: globals,
        name: manifest.babelBoilerplateOptions.mainVarName,
      }
    ]
  },
  {
    input: input,
    external: external,
    plugins: [
      resolve(),
      babel({ babelHelpers: 'bundled' }),
      terser()
    ],
    output: [
      {
        file: destinationFolder + '/' + umdExportFileName + '.min.js',
        format: 'umd',
        sourcemap: true,
        globals: globals,
        name: manifest.babelBoilerplateOptions.mainVarName,
      }
    ]
  }
];
