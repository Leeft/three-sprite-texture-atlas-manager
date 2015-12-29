import IconLabel from '../../src/icon-label';
import IconLabelSymbol from '../../src/icon-label-symbol';
import TextureManager from '../../src/texture-manager';
import KnapsackNode from '../../src/texture-manager/knapsack/node';

const standardTestLabel = () => {
  return new IconLabel({
    textureManager: new TextureManager(),
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
    bold: false,
    icons: [
      new IconLabelSymbol({ code: 'a' }),
      new IconLabelSymbol({ code: 'b' }),
    ],
    debugIconDrawing: true,
  });
};

describe( 'IconLabel: object instantiation', () => {
  it( 'dies without any arguments', () => {
    const fn = function() { new IconLabel(); }
    expect( fn ).to.throw( Error );
  });

  it( 'dies with a regular variable as argument', () => {
    const fn = function() { new IconLabel( 'boom' ); }
    expect( fn ).to.throw( Error );
  });

  it( 'dies with an empty object as argument', () => {
    const fn = function() { new IconLabel({}); }
    expect( fn ).to.throw( Error );
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

  it( 'lives with valid arguments', () => {
    const fn = function() {
      new IconLabel({
        textureManager: new TextureManager(),
        text: 'Kaboom',
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

describe( 'IconLabel: .icons property and friends', () => {
  it( `.icons marks the label as dirty when it is updated`, () => {
    const label = standardTestLabel();
    expect( label ).to.have.a.property('isDirty').which.is.true;
    label.isDirty = false;
    expect( label ).to.have.a.property('isDirty').which.is.false;
    // Stays false after setting the text to itself
    label.icons = [];
    expect( label ).to.have.a.property('isDirty').which.is.true;

    // FIXME: Crude code coverage padding :D
    label.redraw();
    label.icons =[];
  });
});


describe( 'IconLabel: .node', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  it( 'returns a KnapsackNode', () => {
    expect( label ).to.have.property('node').which.is.an.instanceof( KnapsackNode );
  });

  it( 'keeps returning the same object', () => {
    const node = label.node;
    expect( label ).to.have.property('node').which.equals( node );
    expect( label ).to.have.property('node').which.equals( node );
  });

  // FIXME
  xit( 'is reallocated when needed', () => {
    const firstNode = label.node;
    label.text = 'A much longer string sdfd s df sd fs dff d fsdf sd fsd f';
    const secondNode = label.node;
    expect( secondNode ).to.not.equal( firstNode );
  });

  it( 'a shorter text may reuse the node', () => {
    label.text = 'Plenty of characters here';
    const firstNode = label.node;
    label.text = 'Plenty of characters her';
    const secondNode = label.node;
    expect( secondNode ).to.equal( firstNode );
  });
});

describe( 'IconLabel: .sprite and .hasSprite', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  describe( 'getting the .sprite property', () => {
    it( `returns a valid sprite`, () => {
      expect( label ).to.have.a.property('sprite').which.is.an('object')
        .and.is.instanceOf( THREE.Sprite );
    });

    it( `continues to return the same sprite`, () => {
      const sprite = label.buildSprite();
      expect( label ).to.have.a.property('sprite').which.is.an('object')
        .and.equals( sprite );
    });
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

    label.redraw();

    expect( clipSpy ).to.have.been.called.once;
    expect( drawSpy ).to.have.been.called.once;
    expect( restoreSpy ).to.have.been.called.once;
  });

  it( 'restores the canvas context when an error is thrown while drawing', () => {
    const node = label.node;

    const stubbed = stub( label, 'drawSprite', () => { throw new Error( 'kaboom' ) } );
    const clipSpy = spy( node, 'clipContext' );
    const restoreSpy = spy( node, 'restoreContext' );

    expect( () => { label.redraw() } ).to.throw( Error, 'kaboom' );

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

  it( 'removes the sprite from the parent and clean up after itself', () => {
    const obj = new THREE.Object3D();
    const sprite = label.sprite;
    obj.add( sprite );
    expect( sprite.parent ).to.equal( obj );
    label.destroy();
    expect( sprite.parent ).to.equal( null );
    expect( label._sprite ).to.equal( null );
    expect( label._node ).to.equal( null );
    expect( label._material ).to.equal( null );
  });

  it( 'is safe to call destroy without a .sprite', () => {
    label.buildSprite();
    label._sprite = null;
    label.destroy();
  });

  it( 'is safe to call destroy without a .node', () => {
    label.buildSprite();
    label._node = null;
    label.destroy();
  });

  it( 'is safe to call destroy without a .material', () => {
    label.buildSprite();
    label._material = null;
    label.destroy();
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
      clearRect: function() {},
      rect: function() {},
      stroke: function() {},
      beginPath: function() {},
      closePath: function() {},
    });

    label.drawSprite( fakeContext, { width: 100, height: 90 } );

    // XXX: Should we test that certain properties have been set?
    // That might be too much implementation detail though
    expect( fakeContext.scale ).to.not.have.been.called;
    expect( fakeContext.fillText ).to.have.been.calledWithExactly( label.text, 0, label.textVerticalOffset * label.scale );
    expect( fakeContext.strokeText ).to.have.been.calledWithExactly( label.text, 0, label.textVerticalOffset * label.scale );
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

    it( 'the label is dirty before it is generated', () => {
      expect(label).to.have.property('isDirty').which.equals( true ); // No sprite yet, so always dirty
    });

    it( 'the label is no longer dirty when generated', () => {
      label.buildSprite();
      expect(label).to.have.property('isDirty').which.equals( false );
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

    it( `setting the .bold property has effect on fontStyle`, () => {
      label.bold = true;
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^Bold \\d+px ${ label.fontFamily }` ) );
      label.bold = false;
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^\\d+px ${ label.fontFamily }` ) );
    });
  });

  it( 'setting .text triggers a rebuild of the sprite if .buildSprite() is called', () => {
    expect(label).to.have.property('isDirty').to.equal( true );

    const sprite = label.buildSprite();
    expect(label).to.have.property('isDirty').to.equal( false );
  });
});
