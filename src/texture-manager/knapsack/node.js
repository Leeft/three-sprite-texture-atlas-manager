/**
Represents a single rectangular area "node" within a texture atlas canvas, which may have its own {@link external:Texture|`THREE.Texture`} with the UV coordinates managed for you. These nodes are created through {@link module:texture-manager#allocateNode|`allocateNode()`}.

The implementation is based on [http://www.blackpawn.com/texts/lightmaps/default.html](http://www.blackpawn.com/texts/lightmaps/default.html).

@module texture-manager/knapsack/node
@example
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
*/

import KnapsackRectangle from './rectangle';

/**
 * @constructor
 * @param {Knapsack} - The {@link module:texture-manager/knapsack|`Knapsack`} this node is to become a part of.
 */
class KnapsackNode {
  constructor( knapsack ) {
    /**
     * Reference to the {@link module:texture-manager/knapsack|`Knapsack`} this node is a part of
     * @type {Knapsack}
     * @private
     * @readonly
     */
    this.knapsack = knapsack;

    /**
     * Optional reference to the "left" side {@link module:texture-manager/knapsack/node|`KnapsackNode`} branch of the tree of nodes.
     * @type {KnapsackNode}
     * @private
     * @readonly
     */
    this.leftChild = null;

    /**
     * Optional reference to the "right" side {@link module:texture-manager/knapsack/node|`KnapsackNode`} branch of the tree of nodes.
     * @type {KnapsackNode}
     * @private
     * @readonly
     */
    this.rightChild = null;

    /**
     * Describes the coordinates which are the boundaries of this node.
     * @type {KnapsackRectangle}
     * @private
     * @readonly
     */
    this.rectangle = null;
    // Overwritten when children are created, but done as a default here to keep
    // the code cleaner. Instantiating this object is pretty cheap anyway.
    this.rectangle = new KnapsackRectangle( 0, 0, knapsack.textureSize, knapsack.textureSize );

    /**
     * Internal unique ID for the image this node represents.
     * @type {string}
     * @readonly
     */
    this.imageID = null;

    this._texture = null;
  }

  /**
   * The HTML `<canvas>` element as supplied by the {@link module:texture-manager/knapsack|`Knapsack`} which this node is part of.
   * @type {external:canvas}
   * @readonly
   */
  get canvas () { return this.knapsack.canvas; }

  /**
   * Convenience accessor for the {@link external:CanvasRenderingContext2D} which is associated with the {@link module:texture-manager/knapsack/node#canvas}. You can use this context to draw on the entire canvas, but you'll probably want to use {@link module:texture-manager/knapsack/node#clipContext|`clipContext()`} instead.
   * @type {external:CanvasRenderingContext2D}
   * @readonly
   */
  get context () { return this.knapsack.canvas.getContext('2d'); }

  /**
   * The width in pixels of this sprite's texture node.
   * @type {integer}
   * @readonly
   */
  get width () { return this.rectangle.width; }

  /**
   * The height in pixels of this sprite's texture node.
   * @type {integer}
   * @readonly
   */
  get height () { return this.rectangle.height; }

  /**
   * Lazily built {@link external:Texture|`THREE.Texture`}, with it's UV coordinates already set for you. You can pass this texture straight to your material, and the GPU memory it requires should be shared with all other texture nodes on the same texture.
   * @type {external:Texture}
   * @readonly
   */
  get texture () {
    if ( ! this._texture ) {
      this._texture = this.knapsack.rootTexture.clone();
      this._texture.uuid = this.knapsack.rootTexture.uuid;
      var uvs = this.uvCoordinates();
      this.texture.offset.x = uvs[ 0 ];
      this.texture.offset.y = uvs[ 1 ];
      this.texture.repeat.x = uvs[ 2 ] - uvs[ 0 ];
      this.texture.repeat.y = uvs[ 3 ] - uvs[ 1 ];
    }
    return this._texture;
  }

  /**
   * Returns true if this node has any children, which means it's not available to be drawn in. Its children may be suitable for this though.
   * @returns {boolean}
   * @private
   */
  hasChildren() {
    return ( ( this.leftChild !== null ) || ( this.rightChild !== null ) );
  }

  /**
   * Returns true if this node is available to be used by a texture (i.e. it's not yet been claimed by {@link module:texture-manager/knapsack/node#claim|`claim()`}.
   * @returns {boolean} Indicates whether this node has been claimed or not.
   * @private
   */
  isOccupied() {
    return ( this.imageID !== null );
  }

  /**
   * The UV coordinates which describe where in the texture this node is located.
   * @returns {Array} Array with [ left, top, right, bottom ] coordinates.
   */
  uvCoordinates() {
    var size = this.knapsack.textureSize;
    return [
          ( this.rectangle.left   / size ),
      1 - ( this.rectangle.bottom / size ),
          ( this.rectangle.right  / size ),
      1 - ( this.rectangle.top    / size ),
    ];
  }

  /**
   * Release this node back to the {@link module:texture-manager/knapsack|`Knapsack`} where it is contained. This makes it available to be used by new sprites. Only nodes without children can be released, but a user of this library will only get these leaf nodes returned. Branch nodes are used internally only.
   */
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

  /**
   * Clear the area of this node: it erases the context so that it is empty and transparent, and ready to be drawn to.
   */
  clear() {
    this.context.clearRect( this.rectangle.left, this.rectangle.top, this.width - 1, this.height - 1 );
  }

  /**
   * Set the drawing context tailored towards the area of the sprite, clipping anything outside of it. Plus it sets the drawing position to the center of the node, which makes it easy to draw centered text in the node. When done drawing, use {@link module:texture-manager/knapsack/node#restoreContext|`restoreContext()`} to restore the original drawing context.
   * @returns {CanvasRenderingContext2D} Render context configured exclusively for the sprite we're working on.
   */
  clipContext() {
    var ctx = this.context;
    ctx.save();
    ctx.beginPath();
    ctx.rect( this.rectangle.left + 1, this.rectangle.top + 1, this.width - 2, this.height - 2 );
    ctx.clip();
    ctx.translate( this.rectangle.Xcentre, this.rectangle.Ycentre );
    return ctx;
  }

  /**
   * Restore the draw context of the {@link module:texture-manager/knapsack/node#canvas|`canvas`}. Call this when done drawing the sprite.
   */
  restoreContext() {
    this.context.restore();
  }

  /**
   * Allocate a node in this {@link module:texture-manager/knapsack|`Knapsack`} for the given width and height. This is the main workhorse of this library.
   * @param {integer} width
   * @param {integer} height
   * @returns {KnapsackNode} A new node which describes a rectangular area in the knapsack.
   * @private
   */
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

  /**
   * Claim the node to be in use by giving it a (unique) ID for an image, this prevents it from being used for another image. After calling this method it is ready to be drawn.
   * @private
   */
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
