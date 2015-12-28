import Label from '../../src/label';
import IconLabel from '../../src/icon-label';
import IconLabelSymbol from '../../src/icon-label-symbol';
import TextureManager from '../../src/texture-manager';
import KnapsackNode from '../../src/texture-manager/knapsack/node';

const standardTestLabel = () => {
  return new IconLabel({
    textureManager: new TextureManager(),
    addTo: new THREE.Object3D(),
    text: '    Hurrah   ',
    fontFamily: 'Arial',
    textHeight: 60,
    textVerticalOffset: 1.23,
    textAlign: 'left',
    textBaseline: 'top',
    fillStyle: 'rgb( 123, 123, 123 )',
    strokeStyle: 'rgb( 1, 2, 3 )',
    paddingX: 1.2,
    paddingY: 2.3,
    outline: 3.21,
    scale: 1.321,
    opacity: 0.99,
    icons: [
      new IconLabelSymbol({ code: 'a' }),
      new IconLabelSymbol({ code: 'b' })
    ],
    debugIconDrawing: true,
  });
};

describe('IconLabel: object instantiation', () => {
  xit( 'dies without any arguments', () => {
    const fn = function() { new IconLabel(); }
    expect( fn ).to.throw( TypeError );
    expect( fn ).to.throw( /No texture-manager instance supplied/ );
  });

  xit( 'dies with a regular variable as argument', () => {
    const fn = function() { new IconLabel( 'boom' ); }
    expect( fn ).to.throw( TypeError );
    expect( fn ).to.throw( /No texture-manager instance supplied/ );
  });

  xit( 'dies with an empty object as argument', () => {
    const fn = function() { new IconLabel({}); }
    expect( fn ).to.throw( TypeError );
    expect( fn ).to.throw( /No texture-manager instance supplied/ );
  });

  it( 'dies without a text as argument', () => {
    const fn = function() {
      new IconLabel({
        textureManager: new TextureManager()
      });
    };
    expect( fn ).to.throw( Error );
    expect( fn ).to.throw( /No text supplied/ );
  });

  it( 'dies with an empty text as argument', () => {
    const fn = function() {
      new IconLabel({
        textureManager: new TextureManager(),
        text: '         ',
      });
    };
    expect( fn ).to.throw( Error );
    expect( fn ).to.throw( /No text supplied for the label/ );
  });

  it( 'dies with no "addTo" object as argument', () => {
    const fn = function() {
      new IconLabel({
        textureManager: new TextureManager(),
        text: 'Kaboom',
      });
    };
    expect( fn ).to.throw( TypeError );
    expect( fn ).to.throw( /No valid addTo object supplied/ );
  });

  it( 'dies with an invalid "addTo" object as argument', () => {
    const fn = function() {
      new IconLabel({
        textureManager: new TextureManager(),
        text: 'Kaboom',
        addTo: {},
      });
    };
    expect( fn ).to.throw( TypeError );
    expect( fn ).to.throw( /No valid addTo object supplied/ );
  });

  it( 'lives with a valid "addTo" object as argument', () => {
    const fn = function() {
      new IconLabel({
        textureManager: new TextureManager(),
        text: 'Kaboom',
        addTo: new THREE.Object3D(),
      });
    };
    expect( fn ).to.not.throw( TypeError );
  });

  it( 'has "sensible" default parameters', () => {
    const init = {
      textureManager: new TextureManager(),
      addTo: new THREE.Object3D(),
      text: '123!!!',
    };
    const label = new IconLabel( init );
    expect(label).to.have.property('text').which.equals( '123!!!' );
    expect(label).to.have.property('fontFamily').to.contain( 'sans-serif' );
    expect(label).to.have.property('textHeight').to.be.within( 10, 80 );
    expect(label).to.have.property('textVerticalOffset').to.be.within( -20, 20 );
    expect(label).to.have.property('textAlign').which.equals( 'center' );
    expect(label).to.have.property('textBaseline').which.equals( 'middle' );
    expect(label).to.have.property('fillStyle').to.match( /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/ );
    expect(label).to.have.property('strokeStyle').to.match( /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/ );
    expect(label).to.have.property('paddingX').to.be.within( 0, 20 );
    expect(label).to.have.property('paddingY').to.be.within( 20, 60 );
    expect(label).to.have.property('outline').to.be.within( 0, 10 );
    expect(label).to.have.property('scale').to.equal( 1.0 );
    expect(label).to.have.property('opacity').to.be.within( 0.5, 1.0 );
    expect(label).to.have.property('visible').to.equal( false ); // No sprite yet, so not visible
    expect(label).to.have.property('isDirty').to.equal( true );
  });

  it( 'handles all these parameters', () => {
    const init = {
      textureManager: new TextureManager(),
      addTo: new THREE.Object3D(),
      text: '    Hurrah   ',
      fontFamily: 'Arial',
      textHeight: 60,
      textVerticalOffset: 1.23,
      textAlign: 'left',
      textBaseline: 'top',
      fillStyle: 'rgb( 123, 123, 123 )',
      strokeStyle: 'rgb( 1, 2, 3 )',
      paddingX: 1.2,
      paddingY: 2.3,
      outline: 3.21,
      scale: 1.321,
      opacity: 0.99,
      visible: false,
    };
    const label = new IconLabel( init );
    expect(label).to.have.property('textureManager').which.equals( init.textureManager );
    expect(label).to.have.property('addTo').which.equals( init.addTo );
    expect(label).to.have.property('text').which.equals( 'Hurrah' ); // !!!
    expect(label).to.have.property('fontFamily').which.equals( init.fontFamily );
    expect(label).to.have.property('textHeight').which.equals( init.textHeight );
    expect(label).to.have.property('textVerticalOffset').which.equals( init.textVerticalOffset );
    expect(label).to.have.property('textAlign').which.equals( init.textAlign );
    expect(label).to.have.property('textBaseline').which.equals( init.textBaseline );
    expect(label).to.have.property('fillStyle').which.equals( init.fillStyle );
    expect(label).to.have.property('strokeStyle').which.equals( init.strokeStyle );
    expect(label).to.have.property('paddingX').which.equals( init.paddingX );
    expect(label).to.have.property('paddingY').which.equals( init.paddingY );
    expect(label).to.have.property('outline').which.equals( init.outline );
    expect(label).to.have.property('scale').which.equals( init.scale );
    expect(label).to.have.property('opacity').which.equals( init.opacity );
    expect(label).to.have.property('visible').which.equals( false ); // No sprite yet, never true
    expect(label).to.have.property('isDirty').which.equals( true ); // No sprite yet, so always dirty
  });

  it( `doesn't allow a different textureManager to be set`, () => {
    const textureManager1 = new TextureManager();
    const textureManager2 = new TextureManager();
    const init = {
      textureManager: textureManager1,
      addTo: new THREE.Object3D(),
      text: '123!!!',
    };
    const label = new IconLabel( init );
    expect( () => { label.textureManager = textureManager1 } ).to.not.throw();
    expect( () => { label.textureManager = textureManager2 } ).to.throw( Error, 'Create new label instead of' );
  });
});

describe( 'IconLabel: .text property and friends', () => {
  it( `.text only allows a valid non-empty string to be set`, () => {
    const label = standardTestLabel();
    expect( () => { label.text = '' } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = '        ' } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = null } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = undefined } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = 'a' } ).to.not.throw();
    expect( () => { label.text = '1' } ).to.not.throw();
  });

  it( `.text marks the label as dirty when the text is updated`, () => {
    const label = standardTestLabel();
    expect( label ).to.have.a.property('isDirty').which.is.true;
    label.isDirty = false;
    expect( label ).to.have.a.property('isDirty').which.is.false;
    // Stays false after setting the text to itself
    label.text = label.text;
    expect( label ).to.have.a.property('isDirty').which.is.false;
    label.text = label.text + ' updated';
    expect( label ).to.have.a.property('isDirty').which.is.true;
  });
});

describe( 'IconLabel: the prototype chain is as expected', () => {
  let label;
  beforeEach( () => {
    label = standardTestLabel();
  });

  it( 'Is a regular Label', () => {
    expect( label ).to.be.an('object').which.is.an.instanceof( Label );
  });

  it( 'Is an IconLabel', () => {
    expect( label ).to.be.an('object').which.is.an.instanceof( IconLabel );
  });
});

describe( 'IconLabel: .sprite and .hasSprite', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  describe( 'setting the .sprite property', () => {
    it( `can't be set to null`, () => {
      expect( () => { label.sprite = null } ).to.throw( TypeError, 'Not a valid sprite' );
    });

    it( `can't be set to undefined`, () => {
      expect( () => { label.sprite = undefined } ).to.throw( TypeError, 'Not a valid sprite' );
    });

    it( `can't be set to an object`, () => {
      expect( () => { label.sprite = {} } ).to.throw( TypeError, 'Not a valid sprite' );
    });

    it( 'can be set to a THREE.Sprite', () => {
      expect( () => { label.sprite = new THREE.Sprite(); } ).to.not.throw();
    });

    it( 'setting THREE.Sprite switches .hasSprite to true', () => {
      expect( label ).to.have.a.property('hasSprite').which.is.false;
      expect( () => { label.sprite = new THREE.Sprite(); } ).to.not.throw();
      expect( label ).to.have.a.property('hasSprite').which.is.true;
    });
  });

  describe( 'getting the .sprite property', () => {
    it( `returns a valid sprite`, () => {
      expect( label ).to.have.a.property('sprite').which.is.an('object')
        .and.is.instanceOf( THREE.Sprite );
    });

    it( `continues to return the same sprite`, () => {
      const sprite = label.createSprite();
      expect( label ).to.have.a.property('sprite').which.is.an('object')
        .and.equals( sprite );
    });
  });
});

describe( 'IconLabel: makeSprite() and .visible', () => {
  let label, invisible;

  beforeEach( () => {
    label     = standardTestLabel();
    invisible = standardTestLabel();
    invisible.visible = false;
  });

  describe( '→ .defaultVisible = true', () => {
    it( '.makeSprite() returns a sprite with .visible === true', () => {
      const sprite = label.createSprite();
      expect(sprite).to.be.an('object').which.is.instanceof( THREE.Sprite );
      expect(sprite).to.have.a.property('visible').which.is.true;
    });

    it( '.visible is false by default', () => {
      expect(label).to.have.property('visible').which.equals( false );
    });

    it( '.visible becomes true after setting .sprite', () => {
      label.createSprite();
      expect(label).to.have.property('visible').which.equals( true );
      expect(label.sprite).to.have.property('visible').which.equals( true );
    });
  });

  describe( '→ .defaultVisible = false', () => {
    it( '.makeSprite() returns a sprite with .visible === false', () => {
      const sprite = invisible.createSprite();
      expect(sprite).to.be.an('object').which.is.instanceof( THREE.Sprite );
      expect(sprite).to.have.a.property('visible').which.is.false;
    });

    it( '.visible is false by default', () => {
      expect(invisible).to.have.property('visible').which.equals( false );
    });

    it( '.visible stays false after setting .sprite', () => {
      invisible.sprite = invisible.createSprite();
      expect(invisible).to.have.property('visible').which.equals( false );
    });
  });

  it( '→ sprite also changes visibility as label.visible is set', () => {
    const label = standardTestLabel();
    const sprite = label.createSprite();
    expect(sprite).to.have.a.property('visible').which.equals( true );
    label.visible = false;
    expect(sprite).to.have.a.property('visible').which.equals( false );
    label.visible = true;
    expect(sprite).to.have.a.property('visible').which.equals( true );
    //invisible.visible = false;
    //expect(sprite).to.have.a.property('visible').which.is.false;
  });
});

describe( 'IconLabel: .sprite property', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  // Assumption: .sprite is not lazy
  it( '.hasSprite is false by default', () => {
    expect(label).to.have.property('hasSprite').which.equals( false );
  });

  it( '.sprite throws error and .hasSprite stays false on invalid sprite: null', () => {
    expect( () => { label.sprite = null } ).to.throw( TypeError, 'Not a valid sprite' );
    expect( label ).to.have.property('hasSprite').which.equals( false );
  });

  it( '.sprite throws error and .hasSprite stays false on invalid sprite: undefined', () => {
    expect( () => { label.sprite = undefined } ).to.throw( TypeError, 'Not a valid sprite' );
    expect( label ).to.have.property('hasSprite').which.equals( false );
  });

  it( '.sprite throws error and .hasSprite stays false on invalid sprite: {}', () => {
    expect( () => { label.sprite = {}; } ).to.throw( TypeError, 'Not a valid sprite' );
    expect( label ).to.have.property('hasSprite').which.equals( false );
  });

  it( '.hasSprite becomes true after setting .sprite', () => {
    expect( label ).to.have.property('hasSprite').which.equals( false );
    label.sprite;
    expect( label ).to.have.property('hasSprite').which.equals( true );
  });

  it( 'clips and restores the canvas context when drawing', () => {
    const node = label.node;
    const clipSpy = spy( node, 'clipContext' );
    const drawSpy = spy( label, 'drawSprite' );
    const restoreSpy = spy( node, 'restoreContext' );
    label.sprite;
    expect( clipSpy ).to.have.been.called.once;
    expect( drawSpy ).to.have.been.called.once;
    expect( restoreSpy ).to.have.been.called.once;
  });

  it( 'restores the canvas context when an error is thrown while drawing', () => {
    const node = label.node;
    const stubbed = stub( label, 'drawSprite', () => { throw new Error( 'kaboom' ) } );
    const clipSpy = spy( node, 'clipContext' );
    const restoreSpy = spy( node, 'restoreContext' );
    expect( () => { label.sprite } ).to.throw( Error, 'kaboom' );
    expect( clipSpy ).to.have.been.called.once;
    expect( stubbed ).to.have.been.called.once;
    expect( restoreSpy ).to.have.been.called.once;
  });
});

describe( 'IconLabel: destroy()', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  it( 'calls .destroySprite()', () => {
    const destroySpy = spy( label, 'destroySprite' );
    label.createSprite();
    label.destroy();
    label.destroy();
    expect( destroySpy ).to.have.been.called.twice;
  });

  it( 'is safe to call destroy without a node in .promiseInfo', () => {
    label.createSprite();
    delete label.promiseInfo.node;
    label.destroy();
  });


  it( '.then() returns a promise, and .destroy() works', done => {
    const releaseSpy = spy( label.textureManager, 'release' );
    label.node;
    label.node; // FIXME needs to be a separate test
    label.then( node => {
      label.destroy();
      label.destroy(); // A node can only be released once:
      expect( releaseSpy ).to.have.been.called.once;
      done();
    });
  });
});

describe( 'IconLabel: measureSprite() and drawSprite()', () => {
  // TODO: Maybe include canvas library so real tests can be done?

  it( 'measureSprite() acts on .text property', () => {
    const label = standardTestLabel();

    it( 'works mocked to 9 pixels', () => {
      label.text = 'Nine wide'; // 9 chars, mocked to 9 pixels
      expect( label.measureSprite() ).to.deep.equal([
        Math.floor( 9 + ( label.paddingX * label.scale ) ),
        Math.floor( ( label.textHeight + label.paddingY ) * label.scale )
      ]);
    });

    it( 'works mocked to 22 pixels', () => {
      label.text = 'Much wider than before'; // 22 chars, mocked to 22 pixels
      expect( label.measureSprite() ).to.deep.equal([
        Math.floor( 22 + ( label.paddingX * label.scale ) ),
        Math.floor( ( label.textHeight + label.paddingY ) * label.scale )
      ]);
    });
  });

  it( 'drawSprite() draws on a canvas context', () => {
    const label = standardTestLabel();

    const fakeContext = stub({
      scale: function() {},
      fillText: function() {},
      strokeText: function() {},
      beginPath: function() {},
      closePath: function() {},
      rect: function() {},
      stroke: function() {},
    });

    label.drawSprite( fakeContext, null );

    // XXX: Should we test that certain properties have been set?
    // That might be too much implementation detail though
    expect( fakeContext.scale ).to.not.have.been.called;
    expect( fakeContext.fillText ).to.have.been.calledWithExactly( label.text, 0, label.textVerticalOffset * label.scale );
    expect( fakeContext.strokeText ).to.have.been.calledWithExactly( label.text, 0, label.textVerticalOffset * label.scale );
  });
});

describe( 'IconLabel: insertSprite() and destroySprite()', () => {
  let label, sprite;

  beforeEach( () => {
    label = standardTestLabel();
    sprite = label.sprite;
  });

  it( 'insertSprite() populates .userData on a THREE.Sprite', () => {
    label.insertSprite( sprite );
    expect( sprite.userData ).to.deep.equal({ isLabel: true, label: label });
  });

  it( 'insertSprite() sets the event listener to clear .userData', () => {
    const spriteStub = stub( sprite, 'addEventListener' );
    label.insertSprite( sprite );
    expect( sprite.addEventListener ).to.have.been.called.once;
  });

  it( 'insertSprite() adds the sprite to the addTo object', () => {
    const objectStub = stub( label.addTo, 'add' );
    label.insertSprite( sprite );
    expect( label.addTo.add ).to.have.been.called.once;
  });

  it( 'destroySprite() clears the .userData', () => {
    const cleanUserDataSpy = spy( label, 'cleanUserData' );
    const objectRemoveSpy = spy( label.addTo, 'remove' );

    label.insertSprite( sprite );
    label.sprite = sprite;
    label.destroySprite( sprite );

    expect( objectRemoveSpy ).to.have.been.called.once;
    expect( cleanUserDataSpy ).to.have.been.called.once;
    expect( sprite.userData ).to.deep.equal({});
  });
});

describe('IconLabel: dynamic and lazy properties', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  describe( 'The sprite is generated lazily', () => {
    it( 'the label generates its sprite lazily', () => {
      expect(label).to.have.property('hasSprite').to.be.false; // No sprite yet
    });

    it( 'the label is dirty and invisible before it is generated', () => {
      expect(label).to.have.property('visible').which.equals( false ); // No sprite yet, never true
      expect(label).to.have.property('isDirty').which.equals( true ); // No sprite yet, so always dirty
    });

    it( 'the label is no longer dirty and invisible when generated', () => {
      label.icons = []; // Cheat to increasing code coverage :)  TODO: test properly
      label.createSprite();
      expect(label).to.have.property('visible').which.equals( true );
      expect(label).to.have.property('isDirty').which.equals( false );
    });
  });

  describe( '.hasPromise works correctly', () => {
    it( 'returns false by default', () => {
      expect(label).to.have.property('hasPromise').which.equals( false );
    });

    it( 'returns true after triggering .promise', () => {
      expect(label).to.have.property('hasPromise').which.equals( false );
      label.promise;
      expect(label).to.have.property('hasPromise').which.equals( true );
    });
  });

  describe( 'The .fontStyle property behaves as expected', () => {
    it( 'setting .fontFamily affects .fontStyle', () => {
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^\\d+px ${ label.fontFamily }` ) );
      label.fontFamily = 'Comic Sans';
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^\\d+px ${ label.fontFamily }` ) );
    });

    it( `.fontStyle can't be set directly`, () => {
      label.fontStyle = 'XXX';
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^\\d+px ${ label.fontFamily }` ) );
    });
  });

  it( 'setting .icons triggers a rebuild of the sprite', () => {
    let insertSprite = spy( label.insertSprite );
    let destroySprite = spy( label.destroySprite );
    expect(label).to.have.property('isDirty').to.equal( true );

    const sprite = label.sprite;
    expect(label).to.have.property('isDirty').to.equal( false );

    // Now set the icons, this should trigger a rebuild
    label.icons = [ new IconLabelSymbol({ code: 'z' }) ];

    expect(label).to.have.property('isDirty').to.equal( false );
    expect(label).to.have.property('hasSprite').which.equals( true );
    expect(label).to.have.property('sprite').which.not.equals( sprite );
  });
});
