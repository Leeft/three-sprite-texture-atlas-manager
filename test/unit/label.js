import { expect, assert } from "chai";
import sinon from 'sinon/pkg/sinon.js';
import Label from '../../src/label.js';
import TextureManager from '../../src/texture-manager.js';
import KnapsackNode from '../../src/texture-manager/knapsack/node.js';
import * as THREE from 'three/build/three.js';

const standardTestLabel = () => {
  return new Label({
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
  });
};

describe('Label: object instantiation', () => {
  it( 'dies without any arguments', () => {
    const fn = function() { new Label(); }
    expect( fn ).to.throw( Error );
  });

  it( 'dies with a regular variable as argument', () => {
    const fn = function() { new Label( 'boom' ); }
    expect( fn ).to.throw( Error );
  });

  it( 'dies with an empty object as argument', () => {
    const fn = function() { new Label({}); }
    expect( fn ).to.throw( Error );
  });

  it( 'dies without a text as argument', () => {
    const fn = function() {
      new Label({
        textureManager: new TextureManager()
      });
    };
    expect( fn ).to.throw( Error );
    expect( fn ).to.throw( /No text supplied/ );
  });

  it( 'dies with an empty text as argument', () => {
    const fn = function() {
      new Label({
        textureManager: new TextureManager(),
        text: '         ',
      });
    };
    expect( fn ).to.throw( Error );
    expect( fn ).to.throw( /No text supplied for the label/ );
  });

  it( 'lives with valid arguments', () => {
    const fn = function() {
      new Label({
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
    const label = new Label( init );
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
    const label = new Label( init );
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
    const label = new Label( init );
    expect( () => { label.textureManager = textureManager1 } ).to.not.throw();
    expect( () => { label.textureManager = textureManager2 } ).to.throw( Error, 'Create new label instead of' );
  });
});

describe( 'Label: .text property and friends', () => {
  it( '.text only allows a valid non-empty string to be set', () => {
    const label = standardTestLabel();
    expect( () => { label.text = '' } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = '        ' } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = null } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = undefined } ).to.throw( Error, 'No text supplied' );
    expect( () => { label.text = 'a' } ).to.not.throw();
    expect( () => { label.text = '1' } ).to.not.throw();
  });

  it( '.text marks the label as dirty when the text is updated', () => {
    const label = standardTestLabel();
    expect( label ).to.have.a.property('isDirty').which.is.true;
    label.isDirty = false;
    expect( label ).to.have.a.property('isDirty').which.is.false;
    // Stays false after setting the text to itself
    // eslint-disable-next-line no-self-assign
    label.text = label.text;
    expect( label ).to.have.a.property('isDirty').which.is.false;
    label.text = label.text + ' updated';
    expect( label ).to.have.a.property('isDirty').which.is.true;
  });
});

describe( 'Label: .node', () => {
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

  it( 'is reallocated when needed', () => {
    const firstNode = label.node;
    label.text = 'A much longer string';
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

describe( 'Label: .sprite and .hasSprite', () => {
  let label;

  beforeEach( () => {
    label = standardTestLabel();
  });

  describe( 'getting the .sprite property', () => {
    it( 'returns a valid sprite', () => {
      expect( label ).to.have.a.property('sprite').which.is.an('object')
        .and.is.instanceOf( THREE.Sprite );
    });

    it( 'continues to return the same sprite', () => {
      const sprite = label.buildSprite();
      expect( label ).to.have.a.property('sprite').which.is.an('object')
        .and.equals( sprite );
    });
  });
});

describe( 'Label: .sprite property', () => {
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

    const clipSpy = sinon.spy( node, 'clipContext' );
    const drawSpy = sinon.spy( label, 'drawSprite' );
    const restoreSpy = sinon.spy( node, 'restoreContext' );

    label.redraw();

    assert( clipSpy.calledOnce );
    assert( drawSpy.calledOnce );
    assert( restoreSpy.calledOnce );
  });

  it( 'restores the canvas context when an error is thrown while drawing', () => {
    const node = label.node;

    const stubbed = sinon.stub( label, 'drawSprite' ).callsFake( () => { throw new Error( 'kaboom' ) } );
    const clipSpy = sinon.spy( node, 'clipContext' );
    const restoreSpy = sinon.spy( node, 'restoreContext' );

    expect( () => { label.redraw() } ).to.throw( Error, 'kaboom' );

    assert( stubbed.calledOnce );
    assert( clipSpy.calledOnce );
    assert( restoreSpy.calledOnce );
  });
});

describe( 'Label: destroy()', () => {
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

describe( 'Label: measureSprite() and drawSprite()', () => {
  // TODO: Maybe include canvas library so real tests can be done?

  it( 'measureSprite() acts on .text property', () => {
    const label = standardTestLabel();

    label.text = 'Nine wide';
    const [ initialWidth, initialHeight ] = label.measureSprite();

    label.text = 'Much wider than before';
    const [ width, height ] = label.measureSprite();
    expect( width ).to.be.above( initialWidth );
    expect( height ).to.be.equal( initialHeight );
  });

  it( 'drawSprite() draws on a canvas context', () => {
    const label = standardTestLabel();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const fillTextSpy = sinon.spy( context, 'fillText' );
    const strokeTextSpy = sinon.spy( context, 'strokeText' );

    label.drawSprite( context, { width: 100, height: 90 } );

    // XXX: Should we test that certain properties have been set?
    // That might be too much implementation detail though

    assert( fillTextSpy.withArgs( label.text, 0, label.textVerticalOffset * label.scale ) );
    assert( strokeTextSpy.withArgs( label.text, 0, label.textVerticalOffset * label.scale ) );

    context.strokeText.restore();
    context.fillText.restore();
  });
});

describe('Label: dynamic and lazy properties', () => {
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
      expect( () => { label.fontStyle = 'XXX' } ).to.throw( TypeError );
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^\\d+px ${ label.fontFamily }` ) );
    });

    it( 'setting the .bold property has effect on fontStyle', () => {
      label.bold = true;
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^Bold \\d+px ${ label.fontFamily }` ) );
      label.bold = false;
      expect(label).to.have.property('fontStyle').which.matches( new RegExp( `^\\d+px ${ label.fontFamily }` ) );
    });
  });

  it( 'setting .text triggers a rebuild of the sprite if .buildSprite() is called', () => {
    expect(label).to.have.property('isDirty').to.equal( true );

    label.buildSprite();
    expect(label).to.have.property('isDirty').to.equal( false );
  });
});
