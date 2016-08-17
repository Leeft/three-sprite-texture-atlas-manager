# API documentation

<a name="module_texture-manager"></a>

## texture-manager
Build and destroy "nodes" in your texture atlas easily. It builds one or more [`Knapsack`](#module_texture-manager/knapsack) objects for you, each of which represent a separate square texture atlas with one or more sprite textures of a size defined by you.

**Example**  
```js
// From github:
// $ npm install --save-dev leeft/three-sprite-texture-atlas-manager
// from npm:
// $ npm install --save-dev three-sprite-texture-atlas-manager
//
// Through ES2015 (ES6) modules (highly recommended):
import TextureManager from 'three-sprite-texture-atlas-manager';
var textureManager = new TextureManager();

// Node.js or CommonJS require():
// then:
var TextureManager = require('three-sprite-texture-atlas-manager');
var textureManager = new TextureManager();

// global namespace
var textureManager = new window.threeSpriteAtlasTextureManager();
```
<a name="module_texture-manager..TextureManager"></a>

### texture-manager~TextureManager
**Kind**: inner class of <code>[texture-manager](#module_texture-manager)</code>  

* [~TextureManager](#module_texture-manager..TextureManager)
    * [new TextureManager([size])](#new_module_texture-manager..TextureManager_new)
    * [.debug](#module_texture-manager..TextureManager+debug) : <code>object</code>
    * _allocation_
        * [.allocate(width, height)](#module_texture-manager..TextureManager+allocate) ⇒ <code>KnapsackNode</code>
        * [.allocateNode(width, height)](#module_texture-manager..TextureManager+allocateNode) ⇒ <code>[Promise](#external_Promise)</code>
        * [.allocateASync(width, height)](#module_texture-manager..TextureManager+allocateASync) ⇒ <code>[Promise](#external_Promise)</code>
        * [.solveASync()](#module_texture-manager..TextureManager+solveASync) ⇒ <code>[Promise](#external_Promise)</code>
        * [.release(node)](#module_texture-manager..TextureManager+release)
    * _readonly_
        * [.textureSize](#module_texture-manager..TextureManager+textureSize) : <code>integer</code>
        * [.knapsacks](#module_texture-manager..TextureManager+knapsacks) : <code>object</code>


-

<a name="new_module_texture-manager..TextureManager_new"></a>

#### new TextureManager([size])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [size] | <code>integer</code> | <code>1024</code> | Optional size for the textures. Must be a power of two. |

**Example**  
```js
// We want 512x512 pixel textures
var textureManager = new TextureManager( 512 );
...
textureManager.allocateNode( ... );
```

-

<a name="module_texture-manager..TextureManager+debug"></a>

#### textureManager.debug : <code>object</code>
The debug property can be set to `true` after instantiating the object, which will make the [`KnapsackNode`](#module_texture-manager/knapsack/node) class draw outlines as it allocates nodes. This can make it much more obvious what is going on, such as whether your text is properly sized and centered.

**Kind**: instance namespace of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Example**  
```js
textureManager.debug = true;
```

-

<a name="module_texture-manager..TextureManager+allocate"></a>

#### textureManager.allocate(width, height) ⇒ <code>KnapsackNode</code>
Allocate a texture atlas node for a sprite image of `width` by `height` pixels. Unlike allocateNode, it does not return a {external:Promise} and it works synchronously.

**Kind**: instance method of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: allocation  
**Throws**:

- <code>Error</code> The given with and height must fit in the texture.


| Param | Type |
| --- | --- |
| width | <code>integer</code> | 
| height | <code>integer</code> | 

**Example**  
```js
let node = textureManager.allocate( 100, 20 );
```

-

<a name="module_texture-manager..TextureManager+allocateNode"></a>

#### textureManager.allocateNode(width, height) ⇒ <code>[Promise](#external_Promise)</code>
{external:Promise} based version of [allocate](allocate).

This method will require you to use a {external:Promise} polyfill if you want to support IE11 or older, as that browser doesn't support promises natively.

**Kind**: instance method of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: allocation  

| Param | Type |
| --- | --- |
| width | <code>integer</code> | 
| height | <code>integer</code> | 

**Example**  
```js
textureManager.allocateNode( 100, 20 ).then(
  function( node ) {
    // Do something with the node in this Promise, such as
    // creating a sprite and adding it to the scene.
  },
  function( error ) {
    // Promise was rejected
    console.error( "Could not allocate node:", error );
  }
);
```

-

<a name="module_texture-manager..TextureManager+allocateASync"></a>

#### textureManager.allocateASync(width, height) ⇒ <code>[Promise](#external_Promise)</code>
Asynchronously allocate a texture atlas node for a sprite image of `width` by `height` pixels. Returns a result through resolving the promise. The asynchronous approach will potentially allow for better optimisation of packing nodes in the texture space.

When done adding nodes, you should call [solveASync](solveASync). Your queued promises will then be settled. But note that the {external:Promise} will still be rejected straight away if the given width or height don't fit.

**Kind**: instance method of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: allocation  

| Param | Type |
| --- | --- |
| width | <code>integer</code> | 
| height | <code>integer</code> | 

**Example**  
```js
// First prepare all your node allocations:
[ 1, 2, 3 ].forEach( function() {
  textureManager.allocateASync( 100, 20 ).then(
    function( node ) {
      // Do something with the node in this Promise, such as
      // creating a sprite and adding it to the scene.
      // Note: this promise won't succesfully settle until
      // after you also called solveASync!
    },
    function( error ) {
      // Promise was rejected
      console.error( "Could not allocate node:", error );
    }
  );
});
// Then resolve all the outstanding allocations:
textureManager.solveASync().then( function( result ) {
  console.log( `${ result.length } allocations have resolved` );
});
```

-

<a name="module_texture-manager..TextureManager+solveASync"></a>

#### textureManager.solveASync() ⇒ <code>[Promise](#external_Promise)</code>
Trigger resolution of any outstanding node allocation promises, i.e. those that have been created with [allocateASync](allocateASync). Call this when you've added nodes, or their promises will not settle.

This is by design, as postponing of the node allocation makes it possible for the texture manager to optimise packing of the texture space in the most efficient manner possible.

**Kind**: instance method of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: allocation  
**Throws**:

- <code>Error</code> You're trying to resolve a queue which hasn't been set up. Call [allocateASync](allocateASync) at least once before calling this.

**Example**  
```js
textureManager.solveASync().then( function( count ) {
  console.log( `${ count } node allocations have been resolved` );
});
```

-

<a name="module_texture-manager..TextureManager+release"></a>

#### textureManager.release(node)
Release the given node.

**Kind**: instance method of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: allocation  

| Param | Type |
| --- | --- |
| node | <code>KnapsackNode</code> | 

**Example**  
```js
textureManager.release( node );
```

-

<a name="module_texture-manager..TextureManager+textureSize"></a>

#### textureManager.textureSize : <code>integer</code>
The actual used size of the texture.

**Kind**: instance property of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: readonly  
**Read only**: true  

-

<a name="module_texture-manager..TextureManager+knapsacks"></a>

#### textureManager.knapsacks : <code>object</code>
As the texture manager allocates nodes, it creates a new [`Knapsack`](#module_texture-manager/knapsack) when it needs to provide space for nodes. This is an array with all the knapsacks which have been created.

**Kind**: instance namespace of <code>[TextureManager](#module_texture-manager..TextureManager)</code>  
**Category**: readonly  
**Read only**: true  
**Example**  
```js
// Show the canvases in the DOM element with id="canvases"
// (you'd normally do this from the browser console)
textureManager.knapsacks.forEach( function( knapsack ) {
  document.getElementById('canvases').appendChild( knapsack.canvas );
});
```

-


<a name="module_texture-manager/knapsack/node"></a>

## texture-manager/knapsack/node
Represents a single rectangular area "node" within a texture atlas canvas, which may have its own [`THREE.Texture`](#external_Texture) with the UV coordinates managed for you. These nodes are created through [`allocateNode()`](module:texture-manager#allocateNode).

The implementation is based on [http://www.blackpawn.com/texts/lightmaps/default.html](http://www.blackpawn.com/texts/lightmaps/default.html). Visit that page for a good impression of what we're achieving here.

See http://jsfiddle.net/Shiari/sbda72k9/ for a more complete and working example than the one below.

**Example**  
```js
tetureManager.allocateNode( 100, 20 ).then(
  function( node ) {
    // Do something with the node in this Promise, like create
    // a sprite.
  },
  function( error ) {
    // Promise was rejected
    console.error( "Could not allocate node:", error );
  }
);
```
<a name="module_texture-manager/knapsack/node..KnapsackNode"></a>

### texture-manager/knapsack/node~KnapsackNode
Do not use this directly, it is managed for you.

**Kind**: inner class of <code>[texture-manager/knapsack/node](#module_texture-manager/knapsack/node)</code>  

* [~KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)
    * [new KnapsackNode(knapsack)](#new_module_texture-manager/knapsack/node..KnapsackNode_new)
    * _allocation_
        * [.release()](#module_texture-manager/knapsack/node..KnapsackNode+release)
    * _drawing_
        * [.clear()](#module_texture-manager/knapsack/node..KnapsackNode+clear)
        * [.clipContext()](#module_texture-manager/knapsack/node..KnapsackNode+clipContext) ⇒ <code>CanvasRenderingContext2D</code>
        * [.restoreContext()](#module_texture-manager/knapsack/node..KnapsackNode+restoreContext)
    * _information_
        * [.width](#module_texture-manager/knapsack/node..KnapsackNode+width) : <code>integer</code>
        * [.height](#module_texture-manager/knapsack/node..KnapsackNode+height) : <code>integer</code>
        * [.uvCoordinates()](#module_texture-manager/knapsack/node..KnapsackNode+uvCoordinates) ⇒ <code>Array</code>
    * _provider_
        * [.canvas](#module_texture-manager/knapsack/node..KnapsackNode+canvas) : <code>[canvas](#external_canvas)</code>
        * [.context](#module_texture-manager/knapsack/node..KnapsackNode+context) : <code>[CanvasRenderingContext2D](#external_CanvasRenderingContext2D)</code>
        * [.texture](#module_texture-manager/knapsack/node..KnapsackNode+texture) : <code>[Texture](#external_Texture)</code>


-

<a name="new_module_texture-manager/knapsack/node..KnapsackNode_new"></a>

#### new KnapsackNode(knapsack)

| Param | Type | Description |
| --- | --- | --- |
| knapsack | <code>Knapsack</code> | The [`Knapsack`](#module_texture-manager/knapsack) this node is to become a part of. |


-

<a name="module_texture-manager/knapsack/node..KnapsackNode+release"></a>

#### knapsackNode.release()
Release this node back to the [`Knapsack`](#module_texture-manager/knapsack) where it is contained. This makes it available to be used by new sprites. Only nodes without children can be released, but a user of this library will only get these leaf nodes returned. Branch nodes are used internally only.

**Kind**: instance method of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: allocation  
**Example**  
```js
node.release();
// or, if you like typing:
textureManager.release( node );
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+clear"></a>

#### knapsackNode.clear()
Clear the area of this node: it erases the context so that it is empty and transparent, and ready to be drawn to.

**Kind**: instance method of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: drawing  
**Example**  
```js
// Erase the contents of the sprite
node.clear();
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+clipContext"></a>

#### knapsackNode.clipContext() ⇒ <code>CanvasRenderingContext2D</code>
Set the drawing context tailored towards the area of the sprite, clipping anything outside of it. When done drawing, use [`restoreContext()`](module:texture-manager/knapsack/node#restoreContext) to restore the original drawing context.

**Kind**: instance method of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Returns**: <code>CanvasRenderingContext2D</code> - Render context configured exclusively for the sprite we're working on.  
**Category**: drawing  
**Example**  
```js
var context = node.clipContext();
// Draw a 5px border along the edge of the sprite, some
// of it will fall outside the area, but it is clipped.
context.lineWidth = 5.0;
context.strokeStyle = 'rgba(255,0,0,1)';
context.strokeRect( 0, 0, node.width, node.height );
// other drawing commands
node.restoreContext();
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+restoreContext"></a>

#### knapsackNode.restoreContext()
Restore the draw context of the [`canvas`](module:texture-manager/knapsack/node#canvas). Call this when done drawing the sprite.

**Kind**: instance method of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: drawing  
**Example**  
```js
var context = node.clipContext();
// Draw a 5px border along the edge of the sprite, some
// of it will fall outside the area, but it is clipped.
context.lineWidth = 5.0;
context.strokeStyle = 'rgba(255,0,0,1)';
context.strokeRect( 0, 0, node.width, node.height );
// other drawing commands
node.restoreContext();
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+width"></a>

#### knapsackNode.width : <code>integer</code>
The width in pixels of this sprite's texture node.

**Kind**: instance property of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: information  
**Read only**: true  
**Example**  
```js
textureManager.allocateNode( 30, 10 ).then( function( node ) {
  console.log( node.width ); // => 30
});
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+height"></a>

#### knapsackNode.height : <code>integer</code>
The height in pixels of this sprite's texture node.

**Kind**: instance property of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: information  
**Read only**: true  
**Example**  
```js
textureManager.allocateNode( 30, 10 ).then( function( node ) {
  console.log( node.height ); // => 10
});
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+uvCoordinates"></a>

#### knapsackNode.uvCoordinates() ⇒ <code>Array</code>
The UV coordinates which describe where in the texture this node is located. This is probably not of any practical use to you as a user of this library; it is used internally to map the texture correctly to a sprite.

**Kind**: instance method of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Returns**: <code>Array</code> - Array with [ left, top, right, bottom ] coordinates.  
**Category**: information  
**Example**  
```js
var uvs = node.uvCoordinates();
var left   = uvs[ 0 ];
var top    = uvs[ 1 ];
var right  = uvs[ 2 ];
var bottom = uvs[ 3 ];
```

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+canvas"></a>

#### knapsackNode.canvas : <code>[canvas](#external_canvas)</code>
The HTML `<canvas>` element as supplied by the [`Knapsack`](#module_texture-manager/knapsack) which this node is part of.

**Kind**: instance property of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: provider  
**Read only**: true  

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+context"></a>

#### knapsackNode.context : <code>[CanvasRenderingContext2D](#external_CanvasRenderingContext2D)</code>
Convenience accessor for the [CanvasRenderingContext2D](#external_CanvasRenderingContext2D) which is associated with the [module:texture-manager/knapsack/node#canvas](module:texture-manager/knapsack/node#canvas). You can use this context to draw on the entire canvas, but you'll probably want to use [`clipContext()`](module:texture-manager/knapsack/node#clipContext) instead.

**Kind**: instance property of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: provider  
**Read only**: true  

-

<a name="module_texture-manager/knapsack/node..KnapsackNode+texture"></a>

#### knapsackNode.texture : <code>[Texture](#external_Texture)</code>
Lazily built [`THREE.Texture`](#external_Texture), with it's UV coordinates already set for you. You can pass this texture straight to your material, and the GPU memory it requires should be shared with all other texture nodes on the same texture.

**Kind**: instance property of <code>[KnapsackNode](#module_texture-manager/knapsack/node..KnapsackNode)</code>  
**Category**: provider  
**Read only**: true  
**Example**  
```js
var material = new THREE.SpriteMaterial({
  map: node.texture,
  transparent: true,
  blending: THREE.AdditiveBlending
});
var sprite = new THREE.Sprite( material );
scene.add( sprite );
```

-


# Internal and external global types

- <a name="threeSpriteAtlasTextureManager"></a>

## threeSpriteAtlasTextureManager
**Kind**: global class  

-

<a name="new_threeSpriteAtlasTextureManager_new"></a>

### new threeSpriteAtlasTextureManager([size])
The main entry point for 'global' mode, to be used when you're not able to use `require();` or ES6 modules to load the functionality of this library. Include the library by loading the JavaScript directly, or combine it with your other code, and then do:

```javascript
// Instantiate a new TextureManager with 512x512 textures
var textureManager = new window.threeSpriteAtlasTextureManager( 512 );
```


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [size] | <code>integer</code> | <code>1024</code> | Optional size for the textures. Must be a power of two. |


-


- <a name="external_Promise"></a>

## Promise
JavaScript Promises (ES6)

**Kind**: global external  
**See**: http://www.html5rocks.com/en/tutorials/es6/promises/  

-


- <a name="external_canvas"></a>

## canvas
HTML `<canvas>` element

**Kind**: global external  
**See**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas  

-


- <a name="external_Texture"></a>

## Texture
A `THREE.Texture` object instance

**Kind**: global external  
**See**: http://threejs.org/docs/#Reference/Textures/Texture  

-


- <a name="external_CanvasRenderingContext2D"></a>

## CanvasRenderingContext2D
CanvasRenderingContext2D for drawing onto a `<canvas>`

**Kind**: global external  
**See**: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D  

-


