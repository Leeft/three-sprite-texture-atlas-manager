/*
 * Helper classes to generate a texture map for sprites of various sizes.
 *
 * Represents a single texture atlas and canvas
 *
 * Based on: http://www.blackpawn.com/texts/lightmaps/default.html
 */

import KnapsackNode from './knapsack-node';

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

  // Lazily build the canvas
  get canvas () {
    if ( ! this._canvas ) {
      this._canvas = document.createElement('canvas');
      this._canvas.width  = this.textureSize;
      this._canvas.height = this.textureSize;
    }
    return this._canvas;
  }

  // Each node will .clone() this for itself
  get rootTexture () {
    if ( ! this._rootTexture ) {
      this._rootTexture = new THREE.Texture( this.canvas, THREE.UVMapping );
    }
    return this._rootTexture;
  }

  // Method proxy, adds the given size to the bag if possible
  allocateNode( width, height ) {
    return this.rootNode.allocate( width, height );
  }
}

export default Knapsack;
