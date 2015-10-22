/*
 * Helper classes to generate a texture map for sprites of various sizes.
 *
 * Simple class to describe a rectangular area witin the knapsack.
 */

class KnapsackRectangle {
  constructor( left, top, right, bottom ) {
    this.left   = Math.floor( ( typeof left   === 'number' && isFinite( left   ) ) ? left   : 0 );
    this.top    = Math.floor( ( typeof top    === 'number' && isFinite( top    ) ) ? top    : 0 );
    this.right  = Math.floor( ( typeof right  === 'number' && isFinite( right  ) ) ? right  : 0 );
    this.bottom = Math.floor( ( typeof bottom === 'number' && isFinite( bottom ) ) ? bottom : 0 );
  }

  get Xcentre () { return Math.floor( ( ( this.right - this.left ) / 2 ) + this.left ) - 0.5; }
  get Ycentre () { return Math.floor( ( ( this.bottom - this.top ) / 2 ) + this.top  ) - 0.5; }
  get width ()  { return ( this.right - this.left ); }
  get height () { return ( this.bottom - this.top ); }
}

export default KnapsackRectangle;
