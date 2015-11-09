import Knapsack from '../../../src/texture-manager/knapsack';
import KnapsackNode from '../../../src/texture-manager/knapsack/node';
import KnapsackRectangle from '../../../src/texture-manager/knapsack/rectangle';
import TextureManager from '../../../src/texture-manager';

describe( 'TextureManager → Knapsack → Rectangle:', () => {
  it( `without parameters it's a 0x0 rectangle`, () => {
    const rectangle = new KnapsackRectangle();
    expect( rectangle ).to.be.an('object');
    expect( rectangle ).to.be.an.instanceof( KnapsackRectangle );
    expect( rectangle ).to.have.a.property('left').which.equals( 0 );
    expect( rectangle ).to.have.a.property('top').which.equals( 0 );
    expect( rectangle ).to.have.a.property('right').which.equals( 0 );
    expect( rectangle ).to.have.a.property('bottom').which.equals( 0 );
    expect( rectangle ).to.have.a.property('width').which.equals( 0 );
    expect( rectangle ).to.have.a.property('height').which.equals( 0 );
    // We've set the center "between" pixels as that works better for line
    // drawing in particular on a canvas. There's no hard limit to prevent
    // it going beyond the edge though, so that's why -0.5 shows up here.
    // You'd "never" have a 0 x 0 rectangle for real though ...
    expect( rectangle ).to.have.a.property('Xcentre').which.equals( -0.5 );
    expect( rectangle ).to.have.a.property('Ycentre').which.equals( -0.5 );
  });

  it( `a rectangle of 80x20, offset at 10,5`, () => {
    const rectangle = new KnapsackRectangle( 10, 5, 90, 25 ); // 80 x 20
    expect( rectangle ).to.be.an('object');
    expect( rectangle ).to.be.an.instanceof( KnapsackRectangle );
    expect( rectangle ).to.have.a.property('left').which.equals( 10 );
    expect( rectangle ).to.have.a.property('top').which.equals( 5 );
    expect( rectangle ).to.have.a.property('right').which.equals( 90 );
    expect( rectangle ).to.have.a.property('bottom').which.equals( 25 );
    expect( rectangle ).to.have.a.property('width').which.equals( 80 );
    expect( rectangle ).to.have.a.property('height').which.equals( 20 );
    expect( rectangle ).to.have.a.property('Xcentre').which.equals( 10 + ( 80 / 2 ) - 0.5 );
    expect( rectangle ).to.have.a.property('Ycentre').which.equals(  5 + ( 20 / 2 ) - 0.5 );
  });
});

describe( 'TextureManager → Knapsack → Node:', () => {
  let tm, knapsack, rootNode;

  beforeEach( () => {
    tm = new TextureManager( 256 );
    knapsack = new Knapsack( tm, tm.textureSize );
    rootNode = knapsack.rootNode;
  });

  it( 'basic root node behaviour', () => {
    expect( rootNode ).to.be.an('object');
    expect( rootNode ).to.be.an.instanceof( KnapsackNode );
    expect( rootNode ).to.have.a.property('leftChild').which.is.null;
    expect( rootNode ).to.have.a.property('rightChild').which.is.null;
  });

  it( 'has the expected dynamic property values', () => {
    expect( rootNode ).to.have.a.property('rectangle').which.is.an('object');
    expect( rootNode ).to.have.a.property('canvas').which.equals( knapsack.canvas );
    expect( rootNode ).to.have.a.property('context').which.is.an('object');
  });

  it( `.width and .height map to the knapsack's canvas`, () => {
    expect( rootNode ).to.have.a.property('width').which.equals( knapsack.canvas.width );
    expect( rootNode ).to.have.a.property('height').which.equals( knapsack.canvas.height );
  });

  it( 'responds correctly to these introspection methods', () => {
    expect( rootNode.hasChildren() ).to.be.false;
    expect( rootNode.isOccupied() ).to.be.false;
    expect( rootNode.uvCoordinates() ).to.deep.equals( [ 0, 0, 1, 1 ] );
  });

  it( 'has a correct .texture property', () => {
    expect( rootNode ).to.have.a.property('texture').which.is.an('object');
    expect( rootNode.texture ).to.have.a.property('uuid').which.equals( knapsack.rootTexture.uuid );
  });

  describe( `release() works correctly`, () => {
    it( `root node can be release()d when empty`, () => {
      const fn = () => { rootNode.release() };
      rootNode.texture; // Trigger execution of the code branch which dispose of the texture
      expect( fn ).to.not.throw( Error );
    });

    it( `root node can't be release()d when populated`, () => {
      const fn = () => { rootNode.release() };
      rootNode.allocate( 10, 10 );
      expect( fn ).to.throw( Error, 'has children' );
    });
  });

  it( `.clear() clears the canvas`, () => {
    const clearRect = spy( rootNode.context, 'clearRect' );
    rootNode.clear();
    expect( clearRect ).to.have.been.calledWithExactly( 0, 0, rootNode.width - 1, rootNode.height - 1 );
    expect( clearRect ).to.have.been.called.once;
  });

  it( `.clipContext() clips the canvas correctly`, () => {
    const context       = rootNode.context;
    // The order in which these need to be called to correctly set the
    // clipping area is pretty rigid, so I'm quite ok testing this.
    // Also, we're clipping just shy of the edge as textures can
    // "bleed" into the next one (due to the way shaders sample).
    // TODO: Maybe this can be shortened a bit
    const saveSpy      = spy( context, 'save' );
    const beginPathSpy = spy( context, 'beginPath' );
    const rectSpy      = spy( context, 'rect' );
    const clipSpy      = spy( context, 'clip' );
    const translateSpy = spy( context, 'translate' );
    rootNode.clipContext();
    expect( saveSpy ).to.have.been.called.once;
    expect( saveSpy ).to.have.been.calledWithExactly();
    expect( saveSpy ).to.have.been.calledBefore( beginPathSpy );
    expect( beginPathSpy ).to.have.been.called.once;
    expect( beginPathSpy ).to.have.been.calledWithExactly();
    expect( beginPathSpy ).to.have.been.calledBefore( rectSpy );
    expect( rectSpy ).to.have.been.called.once;
    expect( rectSpy ).to.have.been.calledBefore( clipSpy );
    expect( rectSpy ).to.have.been.calledWithExactly( rootNode.rectangle.left + 1, rootNode.rectangle.top + 1, rootNode.width - 2, rootNode.height - 2 );
    expect( clipSpy ).to.have.been.called.once;
    expect( clipSpy ).to.have.been.calledWithExactly();
    expect( clipSpy ).to.have.been.calledBefore( translateSpy );
    expect( translateSpy ).to.have.been.called.once;
    expect( translateSpy ).to.have.been.calledWithExactly( rootNode.rectangle.Xcentre, rootNode.rectangle.Ycentre );
    expect( translateSpy ).to.have.been.calledAfter( clipSpy );
  });

  it( `.restoreContext() restores the canvas correctly`, () => {
    const restoreSpy = spy( rootNode.context, 'restore' );
    rootNode.restoreContext();
    expect( restoreSpy ).to.have.been.called.once;
    expect( restoreSpy ).to.have.been.calledWithExactly();
  });

  // This test is a bit cheeky, raising the code coverage ... the rest
  // of the behaviour is implicitly and well tested elsewhere though.
  it( `.allocate() renders a rectangle with debug on`, () => {
    const strokeRectSpy = spy( rootNode.context, 'strokeRect' );
    rootNode.knapsack.textureManager.debug = true;
    const node = rootNode.allocate( 10, 10 );
    expect( strokeRectSpy ).to.have.been.called.twice;
  });

  it( `.claim() works correctly with debug off`, () => {
    const strokeRectSpy = spy( rootNode.context, 'strokeRect' );
    rootNode.knapsack.textureManager.debug = false;
    rootNode.claim();
    expect( rootNode ).to.have.a.property('imageID').to.match( /^[a-z0-9\-]+$/i );
    expect( strokeRectSpy ).to.not.have.been.called;
  });

  it( `.claim() works correctly with debug on`, () => {
    const strokeRectSpy = spy( rootNode.context, 'strokeRect' );
    rootNode.knapsack.textureManager.debug = true;
    rootNode.claim();
    expect( rootNode ).to.have.a.property('imageID').to.match( /^[a-z0-9\-]+$/i );
    expect( strokeRectSpy ).to.have.been.called.once;
    expect( strokeRectSpy ).to.have.been.calledWithExactly( rootNode.rectangle.left + 0.5, rootNode.rectangle.top + 0.5, rootNode.width - 1, rootNode.height - 1 );
  });
});

describe( 'TextureManager → Knapsack:', () => {
  // TODO: The class doesn't do any parameter validation, so
  // this is all that can be tested here right now
  it( 'instantiates correctly', () => {
    const tm = new TextureManager();
    const knapsack = new Knapsack( tm, tm.textureSize );
    expect( knapsack ).to.be.an('object');
    expect( knapsack ).to.be.an.instanceof( Knapsack );
    expect( knapsack ).to.have.a.property('textureLoaded').which.equals( false );
    expect( knapsack ).to.have.a.property('rootNode').which.is.an.instanceof( KnapsackNode );
    expect( knapsack ).to.have.a.property('_rootTexture').which.is.null;
    expect( knapsack ).to.have.a.property('_canvas').which.is.null;
    expect( knapsack ).to.respondTo( 'allocateNode' );
  });

  // TODO: Maybe we're testing too much of the internals here,
  // do we really care whether it lazily instantiates properties?
  // (a .hasProperty interface could help solve it more cleanly)
  it( '.canvas property works', () => {
    const tm = new TextureManager();
    const knapsack = new Knapsack( tm, tm.textureSize );
    expect( knapsack ).to.have.a.property('_canvas').which.is.null;
    expect( knapsack.canvas ).to.be.an('object');
    expect( knapsack ).to.have.a.property('_canvas').which.equals( knapsack.canvas );
    expect( knapsack.canvas ).to.have.a.property('width').which.equals( tm.textureSize );
    expect( knapsack.canvas ).to.have.a.property('height').which.equals( tm.textureSize );
  });

  it( '.rootTexture property works', () => {
    const tm = new TextureManager();
    const knapsack = new Knapsack( tm, tm.textureSize );
    expect( knapsack ).to.have.a.property('_rootTexture').which.is.null;
    expect( knapsack.rootTexture ).to.be.an('object').which.is.an.instanceof( THREE.Texture );
    expect( knapsack ).to.have.a.property('_rootTexture').which.equals( knapsack.rootTexture );
    expect( knapsack.rootTexture ).to.have.a.property('image').which.equals( knapsack.canvas );
  });

  it( '.allocateNode() proxy method works', () => {
    const tm = new TextureManager();
    const knapsack = new Knapsack( tm, tm.textureSize );
    expect( knapsack.allocateNode( 20, 10 ) ).to.be.an('object').which.is.an.instanceof( KnapsackNode );
  });
});
