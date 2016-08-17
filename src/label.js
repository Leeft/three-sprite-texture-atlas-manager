//import TextureManager from './texture-manager';

const DEFAULTS = {
  fontFamily: `"Segoe UI", "Lucida Grande", "Tahoma", "Calibri", "Roboto", sans-serif`,
  scale: 1.0, // Overall scale, this affects all the other values as well
  bold: false,
  textHeight: 64, // in px
  textVerticalOffset: 8.5, // number of 'scale' units the text is shifted by
  textAlign: `center`,
  textBaseline: `middle`,
  fillStyle: `rgb(255,255,128)`,
  strokeStyle: `rgb(0,0,0)`,
  paddingX: 6, // number of 'scale' units to add to the width
  paddingY: 36.5, // number of 'scale' units to add to the height
  outline: 2.4,
  opacity: 0.75,
};

class Label {
  constructor() {
    Object.assign( this, DEFAULTS, arguments[ 0 ] );

    // Force a check for these important properties
    [ `textureManager`, `text` ].forEach( prop => {
      this[ prop ] = this[ prop ];
    });
  }


  get textureManager () {
    return this._textureManager;
  }

  set textureManager ( tm ) {
    if ( this._textureManager && tm !== this._textureManager ) {
      throw new Error( `Create new label instead of resetting the texture-manager` );
    }
    // FIXME: This check doesn't work well in practice
    //if ( ! ( tm instanceof TextureManager ) ) {
    //  throw new TypeError('No texture-manager instance supplied');
    //}
    this._textureManager = tm;
  }


  get fontStyle () {
    if ( this.bold ) {
      return `Bold ${ (this.textHeight * this.scale).toFixed(0) }px ${ this.fontFamily }`;
    } else {
      return `${ (this.textHeight * this.scale).toFixed(0) }px ${ this.fontFamily }`;
    }
  }


  set text ( text ) {
    if ( ! ( typeof text === `string` ) || ! text.trim().length > 0 ) {
      throw new Error( `No text supplied for the label` );
    }

    text = text.trim();

    if ( text === this._text ) {
      return;
    }

    this.isDirty = true;
    this._text = text;
  }

  get text () {
    return this._text;
  }


  measureSprite () {
    const canvas = document.createElement(`canvas`);
    canvas.width = canvas.height = 1;

    const context = canvas.getContext(`2d`);
    context.font  = this.fontStyle;

    return [
      Math.ceil( context.measureText( this.text ).width + ( this.paddingX * this.scale ) ),
      Math.ceil( ( this.textHeight + this.paddingY ) * this.scale )
    ];
  }


  get hasNode () {
    return ( ( this._node !== undefined ) && ( this._node !== null ) );
  }

  get node () {
    if ( this.hasNode && ( ! this.isDirty ) ) {
      return this._node;
    }

    const [ width, height ] = this.measureSprite();

    let node = this._node;

    if ( this.hasNode )
    {
      // Check whether the current rendering still fits in the node
      if ( width <= node.width && height <= node.height )
      {
        // If it does, the existing node should be somewhat similarly
        // sized, or we'll just have to get a new one
        //
        // TODO: These numbers may require further tweaking!
        if ( ( ( width / node.width ) > 0.9 ) && ( ( height / node.height ) > 0.9 ) )
        {
          return node;
        }
      }

      node.release();
    }

    this._node = node = this.textureManager.allocate( width, height );
    this.isDirty = true;

    // Trigger a refresh of the SpriteMaterial, builds it if needed
    this.material;

    return node;
  }


  get hasMaterial () {
    return ( ( this._material !== null ) && ( this._material !== undefined ) );
  }

  get material () {
    if ( this.hasMaterial )
    {
      if ( ! this.isDirty ) {
        return this._material;
      }

      this._material.map = this.node.texture;
      this._material.needsUpdate = true;
    }
    else
    {
      this._material = new THREE.SpriteMaterial({
        map:          this.node.texture,
        transparent:  true,
        opacity:      this.opacity,
      });
    }

    return this._material;
  }



  get hasSprite () {
    return ( ( this._sprite !== null ) && ( this._sprite !== undefined ) );
  }

  get sprite () {
    if ( this.hasSprite ) {
      return this._sprite;
    }

    this._sprite = new THREE.Sprite( this.material );
    return this._sprite;
  }

  redraw () {
    this.isDirty = true;
    return this.buildSprite();
  }

  buildSprite() {
    if ( this.isDirty )
    {
      const node = this.node;
      try {
        node.clear();
        const context = node.clipContext();
        this.drawSprite( context, node );
        node.restoreContext();
        node.texture.needsUpdate = true;
        this.isDirty = false;
      } catch( e ) {
        node.restoreContext();
        throw e;
      }
    }

    return this.sprite;
  }

  destroy () {
    if ( this.hasSprite ) {
      if ( this._sprite.parent ) {
        this._sprite.parent.remove( this._sprite );
      }
      this._sprite = null;
    }

    if ( this.hasNode ) {
      this.textureManager.release( this.node );
      this._node = null;
    }

    if ( this.hasMaterial ) {
      this._material = null;
    }
  }

  drawSprite ( context /*, node */ ) {
    context.font = this.fontStyle;
    context.textAlign = this.textAlign;
    context.textBaseline = this.textBaseline;
    context.fillStyle = this.fillStyle;
    context.lineCap = `round`;
    context.lineJoin = `round`;
    context.lineWidth = this.outline * this.scale;
    context.miterLimit = 2;
    context.fillText( this.text, 0, this.textVerticalOffset * this.scale );
    context.strokeStyle = this.strokeStyle;
    context.strokeText( this.text, 0, this.textVerticalOffset * this.scale );
  }
}

export default Label;
