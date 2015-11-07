/**
Build and destroy "nodes" in your texture atlas easily. It builds one or more {@link module:texture-manager/knapsack|`Knapsack`} objects for you, each of which represent a separate square texture atlas with one or more sprite textures of a size defined by you.

@module texture-manager

@example
// From github:
// $ npm install --save-dev leeft/three-sprite-texture-atlas-manager
// from npm:
// $ npm install --save-dev three-sprite-texture-atlas-manager
//
// Through ES2015 modules (highly recommended)
import TextureManager from 'three-sprite-texture-atlas-manager';
var textureManager = new TextureManager();

// node.js or CommonJS require()
// then:
var TextureManager = require('three-sprite-texture-atlas-manager');
var textureManager = new TextureManager();

// global namespace
var textureManager = new window.threeSpriteAtlasTextureManager();
 *
 */

import Knapsack from './texture-manager/knapsack';

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
    this.size = ( ( typeof size === 'number' ) && /^(128|256|512|1024|2048|4096|8192|16384)$/.test( size ) ) ? size : 1024;

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
   * Allocate a texture atlas node for a sprite image of `width` by `height` pixels.
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
    var self = this;

    return ( new Promise( function( resolve, reject ) {
      let node;

      // Prevent allocating knapsacks when there's no chance to fit the node
      // FIXME TODO: try a bigger texture size if it doesn't fit?
      if ( width > self.textureSize ) {
        reject( Error( `A width of ${ width } is too large for these textures` ) );
        return;
      }

      if ( height > self.textureSize ) {
        reject( Error( `A height of ${ height } is too large for these textures` ) );
        return;
      }

      if ( ! self.knapsacks.length ) {
        self._addKnapsack( self.size );
      }

      // First try to get a node from the existing knapsacks
      self.knapsacks.forEach( function( knapsack ) {
        if ( node === null || node === undefined ) {
          node = knapsack.allocateNode( width, height );
        }
      });

      // If we didn't get a node here, but it should fit in a knapsack
      // of the same size, so we can allocate a new knapsack
      if ( node === null && ( width <= self.textureSize ) )
      {
        // Didn't get a node yet but it *should* fit, so make a new texture atlas with the same size
        let knapsack = self._addKnapsack( self.textureSize );
        node = knapsack.allocateNode( width, height );
      }

      resolve( node );

      //if ( node === null || node === undefined ) {
      //  // This is not currently reachable, so left out
      //  reject( Error( `Could not allocate a node of size ${ width }x${ height }` ) );
      //} else {
      //  resolve( node );
      //}
    }));
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

/**
 */
