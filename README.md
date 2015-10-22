### three-sprite-texture-atlas-manager ###

[![Travis build status](http://img.shields.io/travis/Leeft/three-sprite-texture-atlas-manager.svg?style=flat)](https://travis-ci.org/Leeft/three-sprite-texture-atlas-manager)
[![Code Climate](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager/badges/gpa.svg)](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager)
[![Test Coverage](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager/badges/coverage.svg)](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager)
[![Dependency Status](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager.svg)](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager)
[![devDependency Status](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager/dev-status.svg)](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager#info=devDependencies)

A "sprite texture atlas" manager for [three.js](http://threejs.org/) r73 (and up). This module allows you to cut up a canvas into several chunks, and then assign each of these chunks to a sprite in your scene. You draw in the canvas yourself, e.g. rendering text there with the canvas API. Splitting up a canvas in a texture atlas like that helps to maximise the use of GPU memory.

This library makes use of [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise), which means that to support IE11 in your WebGL application while making use of this library you'll need a provide a polyfill.

### Run-time requirements ###

* three.js r73 or newer
* Promise/A+ polyfill for IE11 support such as https://github.com/taylorhakes/promise-polyfill or https://github.com/jakearchibald/es6-promise

### Usage ###

To be documented

### License ###

Copyright 2015 [Lianna Eeftinck](https://github.com/leeft/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.