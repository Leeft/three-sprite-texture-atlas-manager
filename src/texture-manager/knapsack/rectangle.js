/**
Describes a rectangular area witin the knapsack. Abstracts the basic math away from the {@link module:texture-manager/knapsack/node|`KnapsackNode`} module.

@module texture-manager/knapsack/rectangle
*/

/**
 * @constructor
 * @param {integer} left - Left most pixel index of this rectangle (0 to `right` - 1 )
 * @param {integer} top - Top most pixel index of this rectangle (0 to `bottom` - 1 )
 * @param {integer} right - Right most pixel index of this rectangle
 * @param {integer} bottom - Bottom most pixel index of this rectangle
*/

class KnapsackRectangle {
  constructor( left, top, right, bottom ) {
    this.left   = Math.floor( ( typeof left   === `number` && isFinite( left   ) ) ? left   : 0 );
    this.top    = Math.floor( ( typeof top    === `number` && isFinite( top    ) ) ? top    : 0 );
    this.right  = Math.floor( ( typeof right  === `number` && isFinite( right  ) ) ? right  : 0 );
    this.bottom = Math.floor( ( typeof bottom === `number` && isFinite( bottom ) ) ? bottom : 0 );
  }

  /**
   * The center X coordinate of this rectangle.
   * @type {integer}
   * @readonly
   */
  get Xcentre () { return Math.floor( ( ( this.right - this.left ) / 2 ) + this.left ) - 0.5; }

  /**
   * The center Y coordinate of this rectangle.
   * @type {integer}
   * @readonly
   */
  get Ycentre () { return Math.floor( ( ( this.bottom - this.top ) / 2 ) + this.top  ) - 0.5; }

  /**
   * The width of this rectangle in pixels.
   * @type {integer}
   * @readonly
   */
  get width ()  { return ( this.right - this.left ); }

  /**
   * The height of this rectangle in pixels.
   * @type {integer}
   * @readonly
   */
  get height () { return ( this.bottom - this.top ); }
}

export default KnapsackRectangle;
