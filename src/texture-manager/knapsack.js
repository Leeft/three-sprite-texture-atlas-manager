/**
Represents a single texture atlas with several sprites and its corresponding base {@link external:Texture|`THREE.Texture`}. You do not interact with this class directly, it is entirely managed for you by a {@link module:texture-manager|`TextureManager`} instance. Documented only to satisfy the curiosity of fellow developers stumbling upon this.

@module texture-manager/knapsack
 */

import KnapsackNode from './knapsack/node';

/**
  * @constructor
  * @param {TextureManager} textureManager - The {@link module:texture-manager|`TextureManager`} which created this `Knapsack`
  * @param {integer} size - The size of the texture
  */
class Knapsack {
  constructor( textureManager, size ) {
    this.textureManager = textureManager;
    this.textureSize = size;
    this.textureLoaded = false;
    this.rootNode = new KnapsackNode( this );
    // Lazy initialising these:
    this._rootTexture = null;
    this._canvas = null;
  }

  /**
   * Lazily built HTML `<canvas>` element for this `Knapsack`.
   * @type {external:canvas}
   * @readonly
   */
  get canvas () {
    if ( ! this._canvas ) {
      this._canvas = document.createElement('canvas');
      this._canvas.width  = this.textureSize;
      this._canvas.height = this.textureSize;
    }
    return this._canvas;
  }

  /**
   * Lazily built {@link external:Texture|`THREE.Texture`}, this is created as a "master" texture. Each node will get its own `.clone()`, which should be shared in memory.
   * @type {external:Texture}
   * @readonly
   */
  get rootTexture () {
    if ( ! this._rootTexture ) {
      this._rootTexture = new THREE.Texture( this.canvas, THREE.UVMapping );
    }
    return this._rootTexture;
  }

  /**
   * Proxy method, allocate a texture atlas node for a sprite image of `width` by `height` pixels.
   * @param {integer} width
   * @param {integer} height
   * @returns {external:Promise}
   */
  allocateNode( width, height ) {
    return this.rootNode.allocate( width, height );
  }
}

export default Knapsack;
