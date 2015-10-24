import threeSpriteTextureAtlasManager from '../../src/three-sprite-texture-atlas-manager';

global.THREE = require('three');

// Mock 'document.createElement()' to return a fake canvas.
// This is a bit more convenient rather than requiring both the canvas
// and jsdom node modules to be installed as well.
global.document = {
  'createElement': function( name ) {
    if ( name === 'canvas' ) {
      return {
        name: 'canvas',
        width: null,
        height: null,
        getContext: function() {
          return {
            clearRect: function() {},
            save: function() {},
            restore: function() {},
            beginPath: function() {},
            rect: function() {},
            clip: function() {},
            translate: function() {}
          };
        },
      };
    }
    throw new Error(`This simple mock doesn't know element type ${ name }`);
  }
};

describe('basic class behaviour', () => {
  let tm;

  it( 'instantiates correctly', () => {
    tm = new threeSpriteTextureAtlasManager( 256 );
    expect(tm).to.be.an('object');
    expect(tm).to.be.an.instanceof( threeSpriteTextureAtlasManager );
  });

  it( 'has the property textureSize', () => {
    expect(tm).to.have.property('textureSize');
    expect(tm.textureSize).to.be.a('number')
      .that.equals( 256 );
  });

  [ 128, 256, 512, 1024, 2048, 4096, 8192, 16384 ].forEach( (size) => {
    it( 'texture size of ' + size + ' is accepted', () => {
      tm = new threeSpriteTextureAtlasManager( size );
      expect(tm.textureSize).to.be.a('number')
        .that.equals( size );
    });
  });

  it( 'textureSize defaults to 1024 on invalid textureSize', () => {
    tm = new threeSpriteTextureAtlasManager( 'plonk' );
    expect(tm.textureSize).to.be.a('number')
      .that.equals( 1024 );

    tm = new threeSpriteTextureAtlasManager( 123 );
    expect(tm.textureSize).to.be.a('number')
      .that.equals( 1024 );
  });
});

describe('multiple knapsack allocation', () => {
  let tm = new threeSpriteTextureAtlasManager( 256 );
  let one, two, three, four, five, six, seven, eight;

  it( 'has no knapsacks to start with', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  it( 'fails to allocates a node too large (horizontally)', () => {
    return tm.allocateNode( tm.textureSize + 1, 1 ).then(
      function( node ) {},
      function( err ) {
        expect(err.toString()).to.contain('too large');
      }
    );
  });

  it( 'still has no knapsacks', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  it( 'fails to allocates a node too large (vertically)', () => {
    return tm.allocateNode( 1, tm.textureSize + 1 ).then(
      function( node ) {},
      function( err ) {
        expect(err.toString()).to.contain('too large');
      }
    );
  });

  it( 'still has no knapsacks', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  // knapsack 1:
  // +----+----+
  // |  1 |  2 |
  // +----+----+
  // |    3    |
  // +---------+

  it( 'allocates the first node correctly (top left)', () => {
    return tm.allocateNode( 128, 128 ).then( function( node ) {
      one = node;
      expect( node ).to.be.an('object');
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 128 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 0.5, 1 ] );
    });
  });

  it( 'now has a single knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 1 );
  });

  it( 'allocates the second node correctly (top right)', () => {
    return tm.allocateNode( 128, 128 ).then( function( node ) {
      two = node;
      expect( node.rectangle.left ).to.equal( 128 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0.5, 0.5, 1, 1 ] );
    });
  });

  it( 'allocates the third node correctly (bottom half)', () => {
    return tm.allocateNode( 256, 128 ).then( function( node ) {
      three = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 256 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 1, 0.5 ] );
    });
  });

  it( 'still has only a single knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 1 );
  });

  it( 'allocating another large node does not add a knapsack', () => {
    return tm.allocateNode( tm.textureSize + 1, 1 ).then(
      function( node ) {},
      function( err ) {
        expect(err.toString()).to.contain('too large');
        expect( tm.knapsacks.length ).to.equal( 1 );
      }
    );
  });

  // knapsack 2:
  // +----------+
  // |    4     |
  // +------+---+
  // |  5   |   |
  // +------+---+

  it( 'allocates the fourth node correctly', () => {
    return tm.allocateNode( 256, 128 ).then( function( node ) {
      four = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 1, 1 ] );
    });
  });

  it( 'allocated a second knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 2 );
  });

  it( 'allocates the fifth node correctly', () => {
    return tm.allocateNode( 200, 128 ).then( function( node ) {
      five = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 200 );
      expect( node.rectangle.bottom ).to.equal( 256 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 0.78125, 0.5 ] );
    });
  });

  // knapsack 3:
  // +---+------+
  // | 6 |      |
  // +---+      |
  // |          |
  // +----------+

  it( 'allocates the sixth node correctly', () => {
    return tm.allocateNode( 64, 128 ).then( function( node ) {
      six = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 64 );
      expect( node.rectangle.bottom ).to.equal( 128 );
    });
  });

  it( 'allocated a third knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 3 );
  });

  it( 'backfilled the seventh node correctly', () => {
    return tm.allocateNode( 56, 128 ).then( function( node ) {
      seven = node;
      expect( node.rectangle.left ).to.equal( 200 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 256 );
    });
  });

  // knapsack 2:
  // +----------+
  // |    4     |
  // +------+---+
  // |  5   | 7 |
  // +------+---+

  it( 'and it did not allocate a fourth knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 3 );
  });

  it ( 'allows for clearing and reallocating the seventh node', () => {
    tm.release( seven );
    return tm.allocateNode( 56, 128 ).then( function( node ) {
      eight = node;
      expect( node.rectangle.left ).to.equal( 200 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 256 );
    });
  });

  // knapsack 2:
  // +----------+
  // |    4     |
  // +------+---+
  // |  5   | 8 |
  // +------+---+

  it( 'and it still did not allocate a fourth knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 3 );
  });

});

// More in depth, testing the code which also uses the THREE.js mocks
describe('in depth testing: full size node', () => {
  let tm = new threeSpriteTextureAtlasManager( 256 );

  it( 'allocated a node as large as the knapsack', () => {
    return tm.allocateNode( tm.textureSize, tm.textureSize ).then(
      function( node ) {
        expect( node ).to.be.an('object');
        expect( node.rectangle.left ).to.equal( 0 );
        expect( node.rectangle.top ).to.equal( 0 );
        expect( node.rectangle.right ).to.equal( tm.textureSize );
        expect( node.rectangle.bottom ).to.equal( tm.textureSize );
        expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 1, 1 ] );
        tm.knapsacks[ 0 ].rootNode.texture; // TODO TEST
        //console.log( tm.knapsacks[ 0 ].rootNode.texture );
        tm.knapsacks[ 0 ].rootNode.release(); // TODO TEST
      },
      function( err ) {}
    );
  });

});

// More in depth, testing the code which also uses the THREE.js mocks
describe('threeSpriteTextureAtlasManager', () => {
  let tm = new threeSpriteTextureAtlasManager( 256 );

  it( 'allocated a node for in-depth testing', () => {
    return tm.allocateNode( tm.textureSize / 2, tm.textureSize / 2 ).then(
      function( node ) {
        expect( node ).to.be.an('object');
        expect( node.rectangle.left ).to.equal( 0 );
        expect( node.rectangle.top ).to.equal( 0 );
        expect( node.rectangle.right ).to.equal( tm.textureSize / 2 );
        expect( node.rectangle.bottom ).to.equal( tm.textureSize / 2 );
        expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 0.5, 1 ] );
        node.canvas;
        node.texture;
        node.clipContext(); // TODO test
        node.restoreContext(); // TODO test
        //console.log( tm.knapsacks[ 0 ].rootNode );
        expect( function() { tm.knapsacks[ 0 ].rootNode.release(); } )
          .to.throw( Error, /still has children/ )
        //console.log( node.texture );
        //console.log( tm.knapsacks[ 0 ].rootTexture );
      },
      function( err ) {}
    );
  });

});
