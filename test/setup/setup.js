module.exports = function() {
  global.expect = global.chai.expect;

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
              measureText: function( text ) { return { width: 12 * text.length } },
              translate: function() {},
            };
          },
        };
      }
      throw new Error(`This simple mock doesn't know element type ${ name }`);
    }
  };

  beforeEach( function() {
    this.sandbox = global.sinon.sandbox.create();
    global.stub = this.sandbox.stub.bind(this.sandbox);
    global.spy = this.sandbox.spy.bind(this.sandbox);
  });

  afterEach( function() {
    delete global.stub;
    delete global.spy;
    this.sandbox.restore();
  });
};
