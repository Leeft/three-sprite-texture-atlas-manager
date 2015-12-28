import Label from './label';

class IconLabel extends Label {
  constructor({
    icons               = [],
    iconSize            = 24,
    iconSpacing         = 2,
    iconVerticalOffset  = -32,
    lineWidth           = 4,
    debugIconDrawing    = false,
  } = {} ) {
    super(...arguments);
    this.icons              = icons;
    this.iconSize           = iconSize;
    this.iconSpacing        = iconSpacing;
    this.iconVerticalOffset = iconVerticalOffset; // number of scale 1.0 units the icons are shifted by
    this.lineWidth          = lineWidth;
    this.debugIconDrawing   = debugIconDrawing;
  }

  get icons () {
    return this._icons;
  }

  set icons ( array ) {
    const hadSprite = this.hasSprite;

    if ( hadSprite ) {
      this.destroySprite();
    }

    this._icons = array;
    this.isDirty = true;

    if ( hadSprite ) {
      this.sprite;
    }
  }


  measureSprite () {
    let [ width, height ] = super.measureSprite();

    let calculatedWidth = 0, calculatedHeight = 0;
    if ( this.icons.length ) {
      // Take a little extra to compensate for possible overflow on the edges:
      // (note that width and height here are already corrected for scale by the parent)
      calculatedWidth = this.iconsWidth() + ( ( this.iconSize / 2 ) * this.scale );
      calculatedHeight = this.iconsHeight();
    }

    return [ Math.ceil( Math.max( calculatedWidth, width ) ), Math.ceil( Math.max( calculatedHeight, height ) ) ];
  }

  iconsWidth () {
    // 3 x icons gives 2 x spacing, so that yields "[X].[X].[X]"
    return Math.ceil(
      (
        ( this.iconSize    *   this.icons.length       ) +
        ( this.iconSpacing * ( this.icons.length - 1 ) )
      )
      * this.scale // and correct for scale
    );
  }

  iconsHeight () {
    return Math.ceil( this.iconSize * this.scale );
  }

  drawSprite ( context, node ) {
    super.drawSprite(...arguments);

    if ( ! this.icons.length ) {
      return;
    }

    // Note: the code calling drawSprite puts us at the centre of the sprite.
    // Drawing must be offset accordingly!

    // All these values are .scale corrected
    const iconsWidth = this.iconsWidth();
    const iconsHeight = this.iconsHeight();
    const iconSize = this.iconSize * this.scale;
    const iconSpacing = this.iconSpacing * this.scale;
    const halfIcon = iconSize / 2;
    const verticalOffset = this.iconVerticalOffset * this.scale;
    let x = - ( iconsWidth / 2 );

    if ( this.debugIconDrawing ) {
      context.beginPath();
      context.rect(
        x, ( verticalOffset - ( iconSize / 2 ) ), // x, y
        iconsWidth, iconsHeight,
      );
      context.lineWidth = 4 * this.scale;
      context.strokeStyle = 'rgba(255,255,0,0.7)';
      context.stroke();
      context.closePath();
    }

    this.icons.forEach( symbol => {

      let offX = 0, offY = 0;
      if ( typeof symbol.offset === 'object' && 'x' in symbol.offset && 'y' in symbol.offset ) {
        [ offX, offY ] = [ symbol.offset.x * this.scale, symbol.offset.y * this.scale ];
      }

      context.font = ( this.iconSize * symbol.scale * this.scale ).toFixed(2) + 'px ' + symbol.fontFamily;
      context.strokeStyle = this.strokeStyle;
      context.textAlign = 'center'; // TODO: more user control?
      context.lineWidth = ( this.lineWidth * this.scale );
      context.textBaseline = 'middle'; // TODO: more user control?
      context.strokeText( symbol.code, ( x + offX + halfIcon ), ( verticalOffset + offY ) );
      context.fillStyle = symbol.color;
      context.fillText( symbol.code, ( x + offX + halfIcon ), ( verticalOffset + offY ) );

      if ( this.debugIconDrawing ) {
        context.beginPath();
        context.rect(
          offX + x, verticalOffset + offY - halfIcon, // x, y
          iconSize - 1.5, iconSize - 1.5, // w, h
        );
        context.lineWidth = 3 * this.scale;
        context.strokeStyle = 'rgba(255,0,0,0.7)';
        context.stroke();
        context.closePath();
      }

      x += ( iconSize + iconSpacing );
    });
  }
}

export default IconLabel;
