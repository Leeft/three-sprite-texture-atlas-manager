import TextureManager from './texture-manager';

const DEFAULTS = {
  fontFamily: `'Segoe UI', 'Lucida Grande', 'Tahoma', 'Calibri', 'Roboto', sans-serif`,
  textHeight: 64, // in px
  textVerticalOffset: 8.5, // number of 'scale' units the text is shifted by
  textAlign: 'center',
  textBaseline: 'middle',
  fillStyle: 'rgb(255,255,128)',
  strokeStyle: 'rgb(0,0,0)',
  paddingX: 6, // number of 'scale' units to add to the width
  paddingY: 36.5, // number of 'scale' units to add to the height
  outline: 2.4,
  scale: 1.0,
  opacity: 0.75,
  visible: true,
};

class Label {
  constructor() {
    Object.assign( this, DEFAULTS, arguments[ 0 ] );

    // Force a check for these important properties
    [ 'textureManager', 'text', 'addTo' ].forEach( prop => {
      this[ prop ] = this[ prop ];
    });
  }


  get textureManager () {
    return this._textureManager;
  }

  set textureManager ( tm ) {
    if ( this._textureManager && tm !== this._textureManager ) {
      throw new Error( 'Create new label instead of resetting the texture-manager' );
    }
    if ( ! ( tm instanceof TextureManager ) ) {
      throw new TypeError('No texture-manager instance supplied');
    }
    this._textureManager = tm;
  }


  set text ( text ) {
    if ( ! ( typeof text === 'string' ) || ! text.trim().length > 0 ) {
      throw new Error( 'No text supplied for the label' );
    }

    text = text.trim();

    if ( text === this._text ) {
      return;
    }

    const hadSprite = this.hasSprite;

    if ( hadSprite ) {
      this.destroySprite();
    }

    this.isDirty = true;
    this._text = text;

    if ( hadSprite ) {
      this.sprite;
    }
  }

  get text () {
    return this._text;
  }


  get addTo () {
    return this._addTo;
  }

  set addTo ( addTo ) {
    if ( ! ( addTo instanceof THREE.Object3D )  ) {
      throw new TypeError( 'No valid addTo object supplied' );
    }
    this._addTo = addTo;
  }


  get hasPromise () {
    return ( ( this._promise !== null ) && ( this._promise !== undefined ) && ( this._promise.promise !== undefined ) );
  }

  set promise ( promise ) {
    throw new Error( `You can't set the promise directly!` );
  }

  get promise () {
    if ( this.hasPromise ) {
      return this.promiseInfo.promise;
    }

    return this.promiseInfo.promise;
  }

  then () {
    return this.promise.then(...arguments);
  }

  get promiseInfo () {
    if ( this._promise ) {
      return this._promise;
    }

    const promiseInfo = {
      node: undefined,
    };

    promiseInfo.promise = new Promise( ( resolve, reject ) => {
      promiseInfo.resolve = resolve;
      promiseInfo.reject = reject;
    }).then( node => {
      // When the promise resolves then record its node in our structure,
      // this makes it trivial to deallocate it when destroying.
      promiseInfo.node = node;
      return node;
    });

    return this._promise = promiseInfo;
  }



  get hasNode () {
    return ( this.promiseInfo.node !== undefined );
  }

  // Make sure the promise exists, then resolve it with an allocated node.
  get node () {
    if ( this.hasNode ) {
      return this.promiseInfo.node;
    }

    const [ width, height ] = this.measureSprite();
    const node = this.textureManager.allocate( width, height );
    this.promiseInfo.node = node;
    this.promiseInfo.resolve( node );
    return node;
  }



  set sprite ( sprite ) {
    if ( ! ( sprite instanceof THREE.Sprite ) ) {
      throw new TypeError( `Not a valid sprite` );
    }
    this._sprite = sprite;
  }

  get hasSprite () {
    return ( ( this._sprite !== null ) && ( this._sprite !== undefined ) );
  }

  get sprite () {
    if ( this.hasSprite ) {
      return this._sprite;
    }

    const node = this.node;

    const material = new THREE.SpriteMaterial({
      map:          node.texture,
      transparent:  true,
      opacity:      this.opacity,
    });

    try {
      const context = node.clipContext();
      this.drawSprite( context, node );
      node.restoreContext();
      this.isDirty = false;
    } catch( e ) {
      node.restoreContext();
      throw e;
    }

    node.texture.needsUpdate = true;

    const sprite = new THREE.Sprite( material );
    sprite.visible = !! this._defaultVisible;
    this.insertSprite( sprite );
    this.sprite = sprite;
    return sprite;
  }

  createSprite() {
    return this.sprite;
  }

  get visible () {
    if ( this.hasSprite ) {
      return this.sprite.visible;
    } else {
      return false;
    }
  }

  set visible ( visible ) {
    if ( this.hasSprite ) {
      //console.log( 'hasSprite, setting visible to', visible );
      this.sprite.visible = visible;
    } else {
      //console.log( 'do not have a sprite' );
    }
    this._defaultVisible = visible;
  }


  get fontStyle () {
    return `${ (this.textHeight * this.scale).toFixed(0) }px ${ this.fontFamily }`;
  }


  destroy () {
    let promise;

    this.destroySprite();

    if ( this.hasPromise )
    {
      const promiseInfo = this._promise;

      if ( promiseInfo.node ) {
        this.textureManager.release( promiseInfo.node );
      }

      try {
        promiseInfo.reject( new Error( 'Label was destroyed' ) );
      } catch ( e ) {
        // We don't care if this reject() fails, but trap any errors just to be sure
        // (maybe some polyfills throw an error if a promise is already settled?)
      };

      this._promise = null;
    }
  }

  /*
   * Callback methods
   */

  cleanUserData () {
    // Callback to clean userData on disposal, this stops a memory leak due to cyclic references
    if ( this.hasSprite ) {
      delete this.sprite.userData.isLabel;
      delete this.sprite.userData.label;
    }
  }

  insertSprite ( sprite ) {
    sprite.userData.isLabel = true;
    sprite.userData.label = this;
    sprite.visible = this._defaultVisible;
    sprite.addEventListener( 'removed', this.cleanUserData );
    this.addTo.add( sprite );
  }

  destroySprite () {
    if ( ! this.hasSprite ) {
      return;
    }

    this.cleanUserData();
    this.addTo.remove( this.sprite );
    this._sprite = null;
  }

  measureSprite () {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    const context = canvas.getContext('2d');
    context.font         = this.fontStyle;
    context.textBaseline = this.textBaseline;
    context.lineWidth    = this.outline;

    let width = context.measureText( this.text ).width + this.paddingX;

    return [
      Math.floor( width * this.scale ),
      Math.floor( ( this.textHeight + this.paddingY ) * this.scale )
    ];
  }

  drawSprite ( context, node ) {
    context.scale( this.scale, this.scale );
    context.font = this.fontStyle;
    context.textAlign = this.textAlign;
    context.textBaseline = this.textBaseline;
    context.fillStyle = this.fillStyle;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = this.outline;
    context.miterLimit = 2;
    context.fillText( this.text, 0, this.textVerticalOffset );
    context.strokeStyle = this.strokeStyle;
    context.strokeText( this.text, 0, this.textVerticalOffset );
  }
}

export default Label;
