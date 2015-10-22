### three-sprite-texture-atlas-manager ###

[![Travis build status](http://img.shields.io/travis/Leeft/three-sprite-texture-atlas-manager.svg?style=flat)](https://travis-ci.org/Leeft/three-sprite-texture-atlas-manager)
[![Code Climate](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager/badges/gpa.svg)](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager)
[![Test Coverage](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager/badges/coverage.svg)](https://codeclimate.com/github/Leeft/three-sprite-texture-atlas-manager/coverage)
[![Dependency Status](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager.svg)](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager)
[![devDependency Status](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager/dev-status.svg)](https://david-dm.org/Leeft/three-sprite-texture-atlas-manager#info=devDependencies)

A "sprite texture atlas" manager for [three.js](http://threejs.org/) r73 (and up). This module allows you to cut up a canvas into several chunks, and then assign each of these chunks to a sprite in your scene. You draw in the canvas yourself, e.g. rendering text there with the canvas context functions.

![example of a generated sprite atlas](screenshots/sprite-atlas-example.png "Actual example of a generated sprite atlas")

Splitting up a canvas in a texture atlas helps to maximise the use of GPU memory, as newer three.js versions are able to be tricked into sharing the texture on the GPU across sprites by making sure their `.uuid` properties do not change. You can use this library with older versions of three.js, but you would miss out on most of the GPU memory advantages.

This library makes use of [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise), which means that to support IE11 in your WebGL application while making use of this library you'll need a provide a polyfill.

### Run-time requirements ###

* three.js r73 or newer
* Promise/A+ polyfill for IE11 support such as https://github.com/taylorhakes/promise-polyfill or https://github.com/jakearchibald/es6-promise

### Example ###

A simple canvas-only online example as per the usage example below: http://jsfiddle.net/Shiari/sbda72k9/.

Missing from the example is how you can free and reallocate nodes, e.g. if you're changing the text in them dynamically.

### Usage ###

```javascript
// We want textures of 1024x1024 pixels (must be a power of two)
var textureManager = new window.threeSpriteAtlasTextureManager( 1024 );

// Make the sprite allocation code render some blue, purple and screen
// borders in the nodes (this helps troubleshooting)
textureManager.debug = true;

var words = [
    'This', 'is', 'a', 'basic example', 'of', 'building', 'a',
    'texture atlas', 'to', 'build', 'unique', 'sprites', 'and share',
    'as', 'much', 'GPU', 'memory', 'as possible'
];

// Some settings for the text we're creating
var fontStyle = "Bold 120px 'Segoe UI', 'Lucida Grande', 'Tahoma', 'Calibri', 'Roboto', sans-serif";
var xPadding = 30;
var yPadding = 30;
var yOffset = -5;

// Need a canvas to determine the text size
var canvas = document.createElement('canvas');
// but its size doesn't matter
canvas.width = canvas.height = 1;

// Keep track of the promises for each node we're creating so that
// we can tell when they're all done
var nodes = [];

words.forEach(function (text) {
    // Calculate the width of the text
    var width = widthOfText(text) + xPadding;
    // You'd base this on your font size, takes some fiddling
    var height = 120 + yPadding;

    // Allocate a node for the text, this returns a promise
    // which on success resolves with a "node":
    var promise = textureManager.allocateNode(width, height);
    promise.then(

    function (node) {
        var context = node.clipContext();
        context.font = fontStyle;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'rgb( 0, 0, 0 )';
        context.fillText(text, 0, yOffset);
        node.restoreContext();
        // If we were using WebGL for this example, here'd you'd be creating your sprite:
        // var sprite = new THREE.Sprite( new THREE.SpriteMaterial({ map: node.texture }) );
        // scene.add( sprite );
    },

    function (error) {
        console.error("Error allocating node:", error);
    });

    nodes.push(promise);
});

// When all the promises are resolved, we're ready to pull out the
// canvases and put them in the DOM so that we can see what happened
Promise.all(nodes).then(function () {
    textureManager.knapsacks.forEach(function (knapsack) {
        document.getElementById('canvases').appendChild(knapsack.canvas);
    });
});


// Determine the width required to render the given text. You'll want
// to use the same (relevant) settings as you would for rendering the text
function widthOfText(text) {
    var context = canvas.getContext('2d');
    context.font = fontStyle;
    return (Math.floor(context.measureText(text).width));
}
```

### License ###

Copyright 2015 [Lianna Eeftinck](https://github.com/leeft/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

