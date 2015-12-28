const DEFAULTS = {
  fontFamily: `FontAwesome`,      // Can override the font to use if needed (note that it won't be loaded for you!)
  color: 'rgba(255,255,255,1.0)', // The color we'll use to render with

  scale: 1.0,                     // Scale can be used to make different icons appear the same size
  offset: { x: 0, y: 0 },         // As does offset (which can be a THREE.Vector2 as well)

  cssClass: 'fa-warning',         // You can use this for HTML generation (this class itself does not use it)
  description: '',                // And the description is for HTML generation as well, I've used it for a legend
};

class IconLabelSymbol {
  constructor() {
    if ( typeof arguments[ 0 ] !== 'object' ) {
      throw new Error( `Symbol requires an object for the constructor` );
    }

    if ( ! ( 'code' in arguments[ 0 ] ) ) {
      throw new Error( `Missing code argument` );
    }

    Object.assign( this, DEFAULTS, arguments[ 0 ] );

    // Force a check for these important properties
    [ 'code', 'scale', 'offset' ].forEach( prop => {
      this[ prop ] = this[ prop ];
    });
  }

  set code ( value ) {
    if ( typeof value !== 'string' || value.length < 1 ) {
      throw new TypeError( `code must be a single character string` );
    }
    if ( value.length !== 1 ) {
      throw new TypeError( `Multiple character code not currently supported (${ value })` );
    }
    this._code = value;
  }

  get code () {
    return this._code;
  }


  set scale ( value ) {
    if ( typeof value !== 'number' ) {
      throw new TypeError( `scale must be a number` );
    }
    if ( Number.isNaN( value ) || value < 0.1 || value > 5.0 ) {
      throw new RangeError( `scale is outside my expected useful range` );
    }
    this._scale = value;
  }

  get scale () {
    return this._scale;
  }


  set offset ( value ) {
    if ( ( value === null ) || ( typeof value !== 'object' ) || ( ! 'x' in value ) || ( ! 'y' in value ) ) {
      throw new TypeError( `offset must be an object with .x and .y properties` );
    }
    this._offset = value;
  }

  get offset () {
    return this._offset;
  }
}

export default IconLabelSymbol;
