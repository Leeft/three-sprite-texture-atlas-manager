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

describe( 'TextureManager: multiple knapsack allocation', () => {
  const tm = new TextureManager( 256 );
  tm.debug = true;
  let one, two, three, four, five, six, seven, eight;

  it( 'has no knapsacks to start with', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  it( 'fails to allocates a node too large (horizontally)', () => {
    return expect( tm.allocateNode( tm.textureSize + 1, 1 ) ).to.eventually.be.rejectedWith( Error, 'too large' );
  });

  it( 'still has no knapsacks', () => {
    expect( tm.knapsacks.length ).to.equal( 0 );
  });

  it( 'fails to allocates a node too large (vertically)', () => {
    return expect( tm.allocateNode( 1, tm.textureSize + 1 ) ).to.eventually.be.rejectedWith( Error, 'too large' );
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

  it( 'allocates the first node correctly (top left)', done => {
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

  it( 'allocates the second node correctly (top right)', done => {
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

  it( 'allocates the third node correctly (bottom half)', done => {
    return tm.allocateNode( 256, 128 ).then( node => {
      three = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 256 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 1, 0.5 ] );
      done();
    });
  });

  it( 'still has only a single knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 1 );
  });

  it( 'allocating another large node does not add a knapsack', done => {
    return tm.allocateNode( tm.textureSize + 1, 1 ).then(
      node => {},
      err => {
        expect( err.toString() ).to.contain('too large');
        expect( tm.knapsacks.length ).to.equal( 1 );
        done();
      }
    );
  });

  // knapsack 2:
  // +----------+
  // |    4     |
  // +------+---+
  // |  5   |   |
  // +------+---+

  it( 'allocates the fourth node correctly', done => {
    return tm.allocateNode( 256, 128 ).then( node => {
      four = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 1, 1 ] );
      done();
    });
  });

  it( 'allocated a second knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 2 );
  });

  it( 'allocates the fifth node correctly', done => {
    return tm.allocateNode( 200, 128 ).then( node => {
      five = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 200 );
      expect( node.rectangle.bottom ).to.equal( 256 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 0.78125, 0.5 ] );
      done();
    });
  });

  // knapsack 3:
  // +---+------+
  // | 6 |      |
  // +---+      |
  // |          |
  // +----------+

  it( 'allocates the sixth node correctly', done => {
    return tm.allocateNode( 64, 128 ).then( node => {
      six = node;
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( 64 );
      expect( node.rectangle.bottom ).to.equal( 128 );
      done();
    });
  });

  it( 'allocated a third knapsack', () => {
    expect( tm.knapsacks.length ).to.equal( 3 );
  });

  it( 'backfilled the seventh node correctly', done => {
    return tm.allocateNode( 56, 128 ).then( node => {
      seven = node;
      expect( node.rectangle.left ).to.equal( 200 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 256 );
      done();
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

  it ( 'allows for clearing and reallocating the seventh node', done => {
    tm.release( seven );
    return tm.allocateNode( 56, 128 ).then( node => {
      eight = node;
      expect( node.rectangle.left ).to.equal( 200 );
      expect( node.rectangle.top ).to.equal( 128 );
      expect( node.rectangle.right ).to.equal( 256 );
      expect( node.rectangle.bottom ).to.equal( 256 );
      done();
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
describe( 'TextureManager: full size node', () => {
  const tm = new TextureManager( 256 );

  it( 'allocated a node as large as the knapsack', done => {
    return tm.allocateNode( tm.textureSize, tm.textureSize ).then( node => {
      expect( node ).to.be.an('object');
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( tm.textureSize );
      expect( node.rectangle.bottom ).to.equal( tm.textureSize );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0, 1, 1 ] );
      done();
    });
  });

});

// More in depth, testing the code which also uses the THREE.js mocks
describe( 'TextureManager: additional in-depth testing', () => {
  const tm = new TextureManager( 256 );

  it( 'allocated a node for in-depth testing', done => {
    return tm.allocateNode( tm.textureSize / 2, tm.textureSize / 2 ).then( node => {
      expect( node ).to.be.an('object');
      expect( node.rectangle.left ).to.equal( 0 );
      expect( node.rectangle.top ).to.equal( 0 );
      expect( node.rectangle.right ).to.equal( tm.textureSize / 2 );
      expect( node.rectangle.bottom ).to.equal( tm.textureSize / 2 );
      expect( node.uvCoordinates() ).to.deep.equal( [ 0, 0.5, 0.5, 1 ] );
      expect( function() { tm.knapsacks[ 0 ].rootNode.release(); } )
        .to.throw( Error, /still has children/ )
      done();
    });
  });

});
