import { expect } from "chai";
import IconLabelSymbol from '../../src/icon-label-symbol.js';
import * as THREE from 'three/build/three.js';

describe('IconLabelSymbol: object instantiation', () => {
  it( 'dies without any arguments', () => {
    const fn = function() { new IconLabelSymbol(); }
    expect( fn ).to.throw( Error );
    expect( fn ).to.throw( /requires an object/ );
  });

  it( 'dies with a regular variable as argument', () => {
    const fn = function() { new IconLabelSymbol( 'boom' ); }
    expect( fn ).to.throw( Error );
    expect( fn ).to.throw( /requires an object/ );
  });

  describe( 'validity of the code argument is checked', () => {
    it( 'dies without a code as argument', () => {
      const fn = function() { new IconLabelSymbol({}); }
      expect( fn ).to.throw( Error );
      expect( fn ).to.throw( /Missing code argument/ );
    });

    it( 'dies with a null code', () => {
      const fn = function() { new IconLabelSymbol({ code: null }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /code must be a single character string/ );
    });

    it( 'dies with a number code', () => {
      const fn = function() { new IconLabelSymbol({ code: 1 }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /code must be a single character string/ );
    });

    it( 'dies with an object code', () => {
      const fn = function() { new IconLabelSymbol({ code: {} }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /code must be a single character string/ );
    });

    it( 'dies with an empty string code', () => {
      const fn = function() { new IconLabelSymbol({ code: '' }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /code must be a single character string/ );
    });

    it( 'dies with a multiple character code', () => {
      const fn = function() { new IconLabelSymbol({ code: 'aa' }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /multiple character code not currently supported/i );
    });

    it( 'lives with a single character code', () => {
      let obj;
      const fn = function() { obj = new IconLabelSymbol({ code: 'a' }); }
      expect( fn ).to.not.throw( TypeError );
      expect( obj ).to.be.an.an.instanceof( IconLabelSymbol );
    });
  });

  describe( 'validity of the scale argument is checked', () => {
    it( 'dies with a null scale', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: null }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /scale must be a number/ );
    });

    it( 'dies with a string scale', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: 'a' }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /scale must be a number/ );
    });

    it( 'dies with an object scale', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: {} }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /scale must be a number/ );
    });

    it( 'dies with an empty string scale', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: '' }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /scale must be a number/ );
    });

    it( 'dies with positive infinity', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: Number.POSITIVE_INFINITY }); }
      expect( fn ).to.throw( RangeError );
      expect( fn ).to.throw( /scale is outside my expected useful range/ );
    });

    it( 'dies with negative infinity', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: Number.NEGATIVE_INFINITY }); }
      expect( fn ).to.throw( RangeError );
      expect( fn ).to.throw( /scale is outside my expected useful range/ );
    });

    it( 'dies with NaN', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', scale: Number.NaN }); }
      expect( fn ).to.throw( RangeError );
      expect( fn ).to.throw( /scale is outside my expected useful range/ );
    });

    it( 'lives with a scale in the valid range [0.1]', () => {
      let obj;
      const fn = function() { obj = new IconLabelSymbol({ code: 'a', scale: 0.1 }); }
      expect( fn ).to.not.throw( TypeError );
      expect( obj ).to.be.an.an.instanceof( IconLabelSymbol );
    });

    it( 'lives with a scale in the valid range [5.0]', () => {
      let obj;
      const fn = function() { obj = new IconLabelSymbol({ code: 'a', scale: 5.0 }); }
      expect( fn ).to.not.throw( TypeError );
      expect( obj ).to.be.an.an.instanceof( IconLabelSymbol );
    });
  });

  describe( 'validity of the offset argument is checked', () => {
    it( 'dies with a null offset', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', offset: null }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /offset must be an object with .x and .y properties/ );
    });

    it( 'dies with a string offset', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', offset: 'a' }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /offset must be an object with .x and .y properties/ );
    });

    it( 'dies with an empty string offset', () => {
      const fn = function() { new IconLabelSymbol({ code: 'a', offset: '' }); }
      expect( fn ).to.throw( TypeError );
      expect( fn ).to.throw( /offset must be an object with .x and .y properties/ );
    });

    it( 'lives with a valid Object offset', () => {
      let obj;
      const fn = function() { obj = new IconLabelSymbol({ code: 'a', offset: { x: 1, y: 2 } }); }
      expect( fn ).to.not.throw( TypeError );
      expect( obj ).to.be.an.an.instanceof( IconLabelSymbol );
      expect( obj ).to.have.property('offset').to.deep.equal({ x: 1, y: 2 });
    });

    it( 'lives with a valid THREE.Vector2 offset', () => {
      let obj;
      const fn = function() { obj = new IconLabelSymbol({ code: 'a', offset: new THREE.Vector2( 1, 2 ) }); }
      expect( fn ).to.not.throw( TypeError );
      expect( obj ).to.be.an.an.instanceof( IconLabelSymbol );
      expect( obj ).to.have.property('offset').to.deep.equal( new THREE.Vector2( 1, 2 ) );
    });
  });

  it( 'has "sensible" default parameters', () => {
    const init = {
      code: 'a',
    };
    const symbol = new IconLabelSymbol( init );
    expect( symbol ).to.have.property('code').which.equals( 'a' );
    expect( symbol ).to.have.property('fontFamily').which.equals( 'FontAwesome' );
    expect( symbol ).to.have.property('scale').which.equals( 1.0 );
    expect( symbol ).to.have.property('offset').to.deep.equal({ x: 0, y: 0 });
    expect( symbol ).to.have.property('cssClass').which.equals( 'fa-warning' );
    expect( symbol ).to.have.property('description').which.equals( '' );
  });

  it( 'handles all these parameters', () => {
    const symbol = new IconLabelSymbol({
      code: '\uf00c',
      fontFamily: 'Mocha',
      scale: 1.0012,
      offset: { x: -1, y: 3, z: 2 },
      cssClass: 'fa-foo',
      description: 'Bingo!',
    });
    expect( symbol ).to.have.property('code').which.equals( '\uf00c' );
    expect( symbol ).to.have.property('fontFamily').which.equals( 'Mocha' );
    expect( symbol ).to.have.property('scale').which.equals( 1.0012 );
    expect( symbol ).to.have.property('offset').to.deep.equal({ x: -1, y: 3, z: 2 });
    expect( symbol ).to.have.property('cssClass').which.equals( 'fa-foo' );
    expect( symbol ).to.have.property('description').which.equals( 'Bingo!' );
  });
});
