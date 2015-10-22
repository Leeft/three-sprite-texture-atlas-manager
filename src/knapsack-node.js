/*
 * Represents a single texture "node" within a larger texture atlas.
 *
 * Based on: http://www.blackpawn.com/texts/lightmaps/default.html
 */

import KnapsackRectangle from './knapsack-rectangle';

class KnapsackNode {
  constructor( knapsack ) {
    this.knapsack = knapsack;
    this.leftChild = null;
    this.rightChild = null;
    this.rectangle = null;
    this.imageID = null;
    this._texture = null;

    // This is overwritten when children are created, but done
    // as a default here to keep the code cleaner. Instantiating
    // this object is pretty cheap anyway.
    this.rectangle = new KnapsackRectangle( 0, 0, knapsack.textureSize, knapsack.textureSize );
  }

  get canvas ()  { return this.knapsack.canvas; }
  get context () { return this.knapsack.canvas.getContext('2d'); }

  get width ()   { return this.rectangle.width; }
  get height ()  { return this.rectangle.height; }

  get texture () {
    if ( ! this._texture ) {
      this._texture = this.knapsack.rootTexture.clone();
      this._texture.uuid = this.knapsack.rootTexture.uuid;
      var uvExtremes = this.uvCoordinates();
      this.texture.offset.x = uvExtremes[ 0 ];
      this.texture.offset.y = uvExtremes[ 1 ];
      this.texture.repeat.x = uvExtremes[ 2 ] - uvExtremes[ 0 ];
      this.texture.repeat.y = uvExtremes[ 3 ] - uvExtremes[ 1 ];
    }
    return this._texture;
  }

  hasChildren() {
    return ( ( this.leftChild !== null ) || ( this.rightChild !== null ) );
  }

  isOccupied() {
    return ( this.imageID !== null );
  }

  uvCoordinates() {
    var size = this.knapsack.textureSize;
    return [
          ( this.rectangle.left   / size ),
      1 - ( this.rectangle.bottom / size ),
          ( this.rectangle.right  / size ),
      1 - ( this.rectangle.top    / size ),
    ];
  }

  release() {
    if ( this.hasChildren() ) {
      throw new Error( 'Can not release tree node, still has children' );
    }

    if ( this._texture !== null ) {
      this._texture.dispose();
      this._texture = null;
    }

    this.clear();
    this.imageID = null;

    return;
  }

  // Clear the area of the node
  clear() {
    this.context.clearRect( this.rectangle.left, this.rectangle.top, this.width - 1, this.height - 1 );
  }

  // Set the context to the centre of the node, and make sure to clip anything
  // outside of the node; this makes it easier to draw in it
  clipContext() {
    var ctx = this.context;
    ctx.save();
    ctx.beginPath();
    ctx.rect( this.rectangle.left + 1, this.rectangle.top + 1, this.width - 2, this.height - 2 );
    ctx.clip();
    ctx.translate( this.rectangle.Xcentre, this.rectangle.Ycentre );
    return ctx;
  }

  // Restore the context of the canvas, call this when done drawing the sprite.
  restoreContext() {
    this.context.restore();
  }

  allocate( width, height ) {
    // If we're not a leaf node
    if ( this.hasChildren() )
    {
      // then try inserting into our first child
      var newNode = this.leftChild.allocate( width, height );
      if ( newNode instanceof KnapsackNode ) {
        newNode.claim();
        return newNode;
      }

      // There was no room: try to insert into second child
      return this.rightChild.allocate( width, height );
    }
    else
    {
      // if there's already an image here, return
      if ( this.isOccupied() ) {
        return null;
      }

      // if this node is too small, give up here
      if ( ( width > this.width ) || ( height > this.height ) ) {
        return null;
      }

      // if we're just the right size, accept
      if ( width === this.width && height === this.height ) {
        this.claim();
        return this;
      }

      // otherwise, got to split this node and create some kids
      this.leftChild  = new KnapsackNode( this.knapsack );
      this.rightChild = new KnapsackNode( this.knapsack );

      // now decide which way to split
      var remainingWidth  = this.width  - width;
      var remainingHeight = this.height - height;

      if ( remainingWidth > remainingHeight )
      {
        // horizontal split
        this.leftChild.rectangle = new KnapsackRectangle(
          this.rectangle.left,
          this.rectangle.top,
          this.rectangle.left + width,
          this.rectangle.bottom
        );

        this.rightChild.rectangle = new KnapsackRectangle(
          this.rectangle.left + width,
          this.rectangle.top,
          this.rectangle.right,
          this.rectangle.bottom
        );
      }
      else
      {
        // vertical split
        this.leftChild.rectangle = new KnapsackRectangle(
          this.rectangle.left,
          this.rectangle.top,
          this.rectangle.right,
          this.rectangle.top + height
        );

        this.rightChild.rectangle = new KnapsackRectangle(
          this.rectangle.left,
          this.rectangle.top + height,
          this.rectangle.right,
          this.rectangle.bottom
        );
      }

      // Some crude painting to help troubleshooting
      if ( this.knapsack.textureManager.debug ) {
        var context = this.context;
        context.lineWidth = 4.0;
        context.strokeStyle = 'rgba(255,0,0,1)';
        context.strokeRect( this.leftChild.rectangle.left, this.leftChild.rectangle.top, this.leftChild.width, this.leftChild.height );

        context.lineWidth = 4.0;
        context.strokeStyle = 'rgba(0,255,0,1)';
        context.strokeRect( this.rightChild.rectangle.left, this.rightChild.rectangle.top, this.rightChild.width, this.rightChild.height );
      }

      // Recurse into the first child to continue the allocation
      return this.leftChild.allocate( width, height );
    }
  }

  // "Allocate" the node by giving it a (unique) ID for an image,
  // this prevents it from being used for another image.
  claim() {
    this.imageID = THREE.Math.generateUUID();

    // Some crude painting to help troubleshooting
    if ( this.knapsack.textureManager.debug ) {
      var context = this.context;
      context.lineWidth = 2.0;
      context.strokeStyle = 'rgba( 0, 0, 255, 1 )';
      context.strokeRect( this.rectangle.left + 0.5, this.rectangle.top + 0.5, this.width - 1, this.height - 1 );
    }
  }
}

export default KnapsackNode;
