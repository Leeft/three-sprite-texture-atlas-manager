/**
Build and destroy "nodes" in your texture atlas easily. It builds one or more {@link module:texture-manager/knapsack|`Knapsack`} objects for you, each of which represent a separate square texture atlas with one or more sprite textures of a size defined by you.

@module texture-manager

@example
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
 *
 */

import Knapsack from './texture-manager/knapsack.js';

/**
  * @constructor
  * @param {integer} [size=1024] Optional size for the textures. Must be a power of two.
  * @example
  * // We want 512x512 pixel textures
  * var textureManager = new TextureManager( 512 );
  * ...
  * textureManager.allocateNode( ... );
  */
class TextureManager {
  constructor( size ) {
    /**
     * The size of the textures as was validated when constructing the object.
     * @namespace module:texture-manager~TextureManager#size
     * @type {integer}
     * @ignore
     * @category readonly
     */
    this.size = ( ( typeof size === `number` ) && /^(128|256|512|1024|2048|4096|8192|16384)$/.test( size ) ) ? size : 1024;

    /**
     * As the texture manager allocates nodes, it creates a new {@link module:texture-manager/knapsack|`Knapsack`} when it needs to provide space for nodes. This is an array with all the knapsacks which have been created.
     * @namespace module:texture-manager~TextureManager#knapsacks
     * @type {Knapsack[]}
     * @readonly
     * @category readonly
     * @example
     * // Show the canvases in the DOM element with id="canvases"
     * // (you'd normally do this from the browser console)
     * textureManager.knapsacks.forEach( function( knapsack ) {
     *   document.getElementById('canvases').appendChild( knapsack.canvas );
     * });
     */
    this.knapsacks = [];

    /**
     * The debug property can be set to `true` after instantiating the object, which will make the {@link module:texture-manager/knapsack/node|`KnapsackNode`} class draw outlines as it allocates nodes. This can make it much more obvious what is going on, such as whether your text is properly sized and centered.
     * @namespace module:texture-manager~TextureManager#debug
     * @type {boolean}
     * @example
     * textureManager.debug = true;
     */
    this.debug = false;
  }

  /**
   * Add a new knapsack to the texture manager.
   * @param {integer} size
   * @returns {Knapsack}
   * @ignore
   */
  _addKnapsack( size ) {
    var knapsack = new Knapsack( this, size );
    this.knapsacks.push( knapsack );
    if ( this.debug ) {
      console.log( `TextureManager: allocated ${ this.textureSize }px texture map #${ this.knapsacks.length }` );
    }
    return knapsack;
  }

  /**
   * The actual used size of the texture.
   * @type {integer}
   * @readonly
   * @category readonly
   */
  get textureSize () {
    return this.size;
  }

  /**
   * Allocate a texture atlas node for a sprite image of `width` by `height` pixels. Unlike allocateNode, it does not return a {external:Promise} and it works synchronously.
   * @param {integer} width
   * @param {integer} height
   * @returns {KnapsackNode}
   * @category allocation
   * @throws {Error} The given with and height must fit in the texture.
   * @example
   * let node = textureManager.allocate( 100, 20 );
   */
  allocate( width, height ) {
    // Prevent allocating knapsacks when there's no chance to fit the node
    // FIXME TODO: try a bigger texture size if it doesn't fit?
    this._validateSize( width, height );
    return this._allocate( width, height );
  }

  /**
   * {external:Promise} based version of {@link allocate}.
   *
   * This method will require you to use a {external:Promise} polyfill if you want to support IE11 or older, as that browser doesn't support promises natively.
   * @param {integer} width
   * @param {integer} height
   * @returns {external:Promise}
   * @category allocation
   * @example
   * textureManager.allocateNode( 100, 20 ).then(
   *   function( node ) {
   *     // Do something with the node in this Promise, such as
   *     // creating a sprite and adding it to the scene.
   *   },
   *   function( error ) {
   *     // Promise was rejected
   *     console.error( "Could not allocate node:", error );
   *   }
   * );
   */
  allocateNode( width, height ) {
    return new Promise( ( resolve, reject ) => {
      try {
        // Prevent allocating knapsacks when there's no chance to fit the node
        // FIXME TODO: try a bigger texture size if it doesn't fit?
        this._validateSize( width, height );
        resolve( this._allocate( width, height ) );
      } catch ( error ) {
        reject( error );
      }
    });
  }

  /**
   * Asynchronously allocate a texture atlas node for a sprite image of `width` by `height` pixels. Returns a result through resolving the promise. The asynchronous approach will potentially allow for better optimisation of packing nodes in the texture space.
   *
   * When done adding nodes, you should call {@link solveASync}. Your queued promises will then be settled. But note that the {external:Promise} will still be rejected straight away if the given width or height don't fit.
   * @param {integer} width
   * @param {integer} height
   * @returns {external:Promise}
   * @category allocation
   * @example
   * // First prepare all your node allocations:
   * [ 1, 2, 3 ].forEach( function() {
   *   textureManager.allocateASync( 100, 20 ).then(
   *     function( node ) {
   *       // Do something with the node in this Promise, such as
   *       // creating a sprite and adding it to the scene.
   *       // Note: this promise won't succesfully settle until
   *       // after you also called solveASync!
   *     },
   *     function( error ) {
   *       // Promise was rejected
   *       console.error( "Could not allocate node:", error );
   *     }
   *   );
   * });
   * // Then resolve all the outstanding allocations:
   * textureManager.solveASync().then( function( result ) {
   *   console.log( `${ result.length } allocations have resolved` );
   * });
   */
  allocateASync( width, height ) {
    if ( ! Array.isArray( this._queue ) ) {
      this._queue = [];
    }

    let queueEntry;

    const promise = new Promise( ( resolve, reject ) => {
      try {
        // Prevent allocating knapsacks when there's no chance to fit the node
        // FIXME TODO: try a bigger texture size if it doesn't fit?
        this._validateSize( width, height );
        // Queue our resolution, which will be settled with .solveASync()
        queueEntry = {
          resolve: resolve,
          reject: reject,
          width: width,
          height: height,
        };
      }
      catch ( error ) {
        reject( error );
      }
    });

    if ( queueEntry ) {
      queueEntry.promise = promise;
      this._queue.push( queueEntry );
    }

    return promise;
  }

  /**
   * Trigger resolution of any outstanding node allocation promises, i.e. those that have been created with {@link allocateASync}. Call this when you've added nodes, or their promises will not settle.
   *
   * This is by design, as postponing of the node allocation makes it possible for the texture manager to optimise packing of the texture space in the most efficient manner possible.
   * @returns {external:Promise}
   * @category allocation
   * @throws {Error} You're trying to resolve a queue which hasn't been set up. Call {@link allocateASync} at least once before calling this.
   * @example
   * textureManager.solveASync().then( function( count ) {
   *   console.log( `${ count } node allocations have been resolved` );
   * });
   */
  solveASync() {
    /*eslint no-unused-vars: 0*/
    if ( ! Array.isArray( this._queue ) ) {
      throw new Error( `You're trying to resolve a queue which hasn't been set up. Call allocateASync before using this.` );
    }

    const promises = [];

    this._queue.forEach( entry => {
      const { promise: promise, resolve: resolve, reject: reject, width: width, height: height } = entry;
      const node = this._allocate( width, height );
      resolve( node );
      promises.push( promise );
    });

    this._queue = [];

    return Promise.all( promises );
  }

  /**
   * Low level helper to assert whether the given width and height will fit.
   * @param {integer} width
   * @param {integer} height
   * @category allocation
   * @throws {Error} Width of <number> is too large for these textures.
   * @throws {Error} Height of <number> is too large for these textures.
   * @private
   * @ignore
   */
  _validateSize( width, height ) {
    if ( width > this.textureSize ) {
      throw new Error( `Width of ${ width } is too large for these textures` );
    }

    if ( height > this.textureSize ) {
      throw new Error( `Height of ${ height } is too large for these textures` );
    }
  }

  /**
   * Low level helper to allocate a texture atlas node for a sprite image of `width` by `height` pixels.
   * @param {integer} width
   * @param {integer} height
   * @returns {KnapsackNode}
   * @category allocation
   * @private
   * @ignore
   */
  _allocate( width, height ) {
    let node = null;

    // First try to get a node from the existing knapsacks
    this.knapsacks.forEach( knapsack => {
      if ( node === null || node === undefined ) {
        node = knapsack.allocateNode( width, height );
      }
    });

    // Didn't get a node yet but it *should* fit, so make a new texture atlas with the same size
    if ( node === null ) {
      let knapsack = this._addKnapsack( this.textureSize );
      node = knapsack.allocateNode( width, height );
    }

    return node;
  }

  /**
   * Release the given node.
   * @param {KnapsackNode} node
   * @category allocation
   * @example
   * textureManager.release( node );
   */
  release( node ) {
    if ( node ) {
      node.release();
    }
  }
}

export default TextureManager;
