import TextureManager from '../../src/texture-manager';

describe( 'TextureManager: constructor behaves correctly', () => {
  it( 'instantiates correctly', () => {
    const tm = new TextureManager( 256 );
    expect( tm ).to.be.an('object');
    expect( tm ).to.be.an.instanceof( TextureManager );
  });

  it( 'has the property textureSize', () => {
    const tm = new TextureManager( 256 );
    expect( tm ).to.have.property('textureSize');
    expect( tm.textureSize ).to.be.a('number').that.equals( 256 );
  });

  it( 'power of two texture sizes are accepted', () => {
    [ 128, 256, 512, 1024, 2048, 4096, 8192, 16384 ].forEach( (size) => {
      const tm = new TextureManager( size );
      expect( tm.textureSize ).to.be.a('number').that.equals( size );
    });
  });

  it( 'textureSize defaults to 1024 on invalid textureSize (1)', () => {
    const tm = new TextureManager( 'plonk' );
    expect( tm.textureSize ).to.be.a('number').that.equals( 1024 );
  });

  it( 'textureSize defaults to 1024 on invalid textureSize (2)', () => {
    const tm = new TextureManager( 123 );
    expect( tm.textureSize ).to.be.a('number').that.equals( 1024 );
  });
});

describe( 'TextureManager: the debug code works', () => {
  const tm = new TextureManager( 256 );
  tm.debug = true; // Make sure debug code goes through testing
  let knapsack;

  it( 'Logs about knapsack creation', () => {
    const logStub = stub( console, 'log' );
    knapsack = tm._addKnapsack( 256 );
    expect( logStub ).to.have.been.calledWithExactly( 'TextureManager: allocated 256px texture map #1' );
    tm._addKnapsack( 256 );
    expect( logStub ).to.have.been.calledWithExactly( 'TextureManager: allocated 256px texture map #2' );
  });

  it( 'Can still allocate a node correctly, and draws outlines in it', () => {
    // Slightly more extensive tests of this drawing done elsewhere
    const strokeRectSpy = spy( knapsack.rootNode.context, 'strokeRect' );
    const node = tm.allocate( 256, 128 );
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 0 );
    expect( node.rectangle.right ).to.equal( 256 );
    expect( node.rectangle.bottom ).to.equal( 128 );
    expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 1, 1 ] );
    expect( strokeRectSpy ).to.have.been.called;
  });
});

describe( 'TextureManager: the generator for allocateASync() and solveASync() works', function() {
  const tm = new TextureManager( 256 );

  it( '.solveASync() initially throws an error', () => {
    expect( () => { tm.solveASync() } ).to.throw( Error, `hasn't been set up` );
  });

  it( 'Can allocate nodes asynchronously', () => {
    tm.allocateASync( 128, 32 );
    tm.allocateASync( 32364, 323432 );
    tm.allocateASync( 64, 32 );
    // Note: the failing 2nd node is not a problem as it fails
    // early and returns its failure to the caller directly.
    const solve = tm.solveASync();
    return expect( solve ).to.eventually.resolve;
  });

  it( 'Handles allocation failure, rejecting on the caller', () => {
    const failing = tm.allocateASync( 323643, 3234323 );
    return expect( failing ).to.eventually.be.rejectedWith( Error, 'too large' );
  });

  it( 'Handles 100% allocation failure, rejecting on .solveASync()', () => {
    tm.allocateASync( 323643, 3234323 );
    tm.allocateASync( 323643, 3234323 );
    const solve = tm.solveASync();
    return expect( solve ).to.eventually.resolve;
  });
});

describe( 'TextureManager: multiple knapsack allocation', () => {
  const tm = new TextureManager( 256 );
  let one, two, three, four, five, six, seven, eight;

  it( 'has no knapsacks to start with', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  it( 'fails to allocates a node too large (horizontally) asynchronously', () => {
    return expect( tm.allocateNode( tm.textureSize + 1, 1 ) ).to.eventually.be.rejectedWith( Error, 'too large' );
  });

  it( 'fails to allocates a node too large (horizontally)', () => {
    expect( () => { tm.allocate( tm.textureSize + 1, 1 ) } ).to.throw( Error, 'too large' );
  });

  it( 'still has no knapsacks', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  it( 'fails to allocates a node too large (vertically) asynchronously', () => {
    return expect( tm.allocateNode( 1, tm.textureSize + 1 ) ).to.eventually.be.rejectedWith( Error, 'too large' );
  });

  it( 'fails to allocates a node too large (vertically)', () => {
    expect( () => { tm.allocate( 1, tm.textureSize + 1 ) } ).to.throw( Error, 'too large' );
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

  it( 'allocates the first node correctly (top left)  (asynchronous method)', done => {
    return tm.allocateNode( 128, 128 ).then( node => {
      one = node;
      expect( node ).to.be.an('object');
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 128 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 0.5, 1 ] );
      done();
    });
  });

  it( 'now has a single knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 1 );
  });

  it( 'allocates the second node correctly (top right) (asynchronous method)', done => {
    return tm.allocateNode( 128, 128 ).then( node => {
      two = node;
      expect( node.rectangle.left ).to.equal( 128 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0.5, 0.5, 1, 1 ] );
      done();
    });
  });

  it( 'allocates the third node correctly (bottom half)', () => {
    const node = tm.allocate( 256, 128 );
    three = node;
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 128 );
    expect( node.rectangle.right ).to.equal( 256 );
    expect( node.rectangle.bottom ).to.equal( 256 );
    expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 1, 0.5 ] );
  });

  it( 'still has only a single knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 1 );
  });

  it( 'allocating another large node does not add a knapsack', () => {
    expect( () => { tm.allocate( tm.textureSize + 1, 1 ) } ).to.throw( Error, 'too large' );
    expect( tm.knapsacks.length ).to.equal( 1 );
  });

  // knapsack 2:
  // +----------+
  // |    4     |
  // +------+---+
  // |  5   |   |
  // +------+---+

  it( 'allocates the fourth node correctly', () => {
    const node = tm.allocate( 256, 128 );
    four = node;
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 0 );
    expect( node.rectangle.right ).to.equal( 256 );
    expect( node.rectangle.bottom ).to.equal( 128 );
    expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 1, 1 ] );
  });

  it( 'allocated a second knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 2 );
  });

  it( 'allocates the fifth node correctly', () => {
    const node = tm.allocate( 200, 128 );
    five = node;
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 128 );
    expect( node.rectangle.right ).to.equal( 200 );
    expect( node.rectangle.bottom ).to.equal( 256 );
    expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 0.78125, 0.5 ] );
  });

  // knapsack 3:
  // +---+------+
  // | 6 |      |
  // +---+      |
  // |          |
  // +----------+

  it( 'allocates the sixth node correctly', () => {
    const node = tm.allocate( 64, 128 );
    six = node;
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 0 );
    expect( node.rectangle.right ).to.equal( 64 );
    expect( node.rectangle.bottom ).to.equal( 128 );
  });

  it( 'allocated a third knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 3 );
  });

  it( 'backfilled the seventh node correctly', () => {
    const node = tm.allocate( 56, 128 );
    seven = node;
    expect( node.rectangle.left ).to.equal( 200 );
    expect( node.rectangle.top ).to.equal( 128 );
    expect( node.rectangle.right ).to.equal( 256 );
    expect( node.rectangle.bottom ).to.equal( 256 );
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
    const node = tm.allocate( 56, 128 );
    eight = node;
    expect( node.rectangle.left ).to.equal( 200 );
    expect( node.rectangle.top ).to.equal( 128 );
    expect( node.rectangle.right ).to.equal( 256 );
    expect( node.rectangle.bottom ).to.equal( 256 );
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
describe( 'TextureManager: full size node', () => {
  const tm = new TextureManager( 256 );

  it( 'allocated a node as large as the knapsack', () => {
    const node = tm.allocate( tm.textureSize, tm.textureSize );
    expect( node ).to.be.an('object');
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 0 );
    expect( node.rectangle.right ).to.equal( tm.textureSize );
    expect( node.rectangle.bottom ).to.equal( tm.textureSize );
    expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 1, 1 ] );
  });

});

// More in depth, testing the code which also uses the THREE.js mocks
describe( 'TextureManager: additional in-depth testing', () => {
  const tm = new TextureManager( 256 );

  it( 'allocated a node for in-depth testing', () => {
    const node = tm.allocate( tm.textureSize / 2, tm.textureSize / 2 );
    expect( node ).to.be.an('object');
    expect( node.rectangle.left ).to.equal( 0 );
    expect( node.rectangle.top ).to.equal( 0 );
    expect( node.rectangle.right ).to.equal( tm.textureSize / 2 );
    expect( node.rectangle.bottom ).to.equal( tm.textureSize / 2 );
    expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 0.5, 1 ] );
    expect( function() { tm.knapsacks[ 0 ].rootNode.release(); } )
      .to.throw( Error, /still has children/ )
  });

});
