/*
 * Manages the texture canvas(es) for the system labels using the Knapsack class
 */

import Knapsack from './knapsack';

class TextureManager {
  constructor( size ) {
    this.size = ( typeof size === 'number' && /^(128|256|512|1024|2048|4096|8192|16384)$/.test( size ) ) ? size : 1024;
    this.knapsacks = [];
    this.debug = false;
  }

  _addKnapsack( size ) {
    var knapsack = new Knapsack( this, size );
    this.knapsacks.push( knapsack );
    if ( this.debug ) {
      console.log( `TextureManager: allocated ${ this.textureSize }px texture map #${ this.knapsacks.length }` );
    }
    return knapsack;
  }

  get textureSize () {
    return this.size;
  }

  // Claim a texture atlas slot for an image of width x height pixels,
  // will create a new texture atlas if needed.
  // Returns a Promise.
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

      if ( node === null || node === undefined ) {
        reject( Error( `Could not allocate a node of size ${ width }x${ height }` ) );
      } else {
        resolve( node );
      }
    }));
  }

  release( node ) {
    if ( node ) {
      node.release();
    }
  }
}

export default TextureManager;
