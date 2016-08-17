module.exports = function() {
  global.expect = global.chai.expect;

  global.THREE = require('three');

  const context = {
    clearRect: function() {},
    save: function() {},
    restore: function() {},
    beginPath: function() {},
    closePath: function() {},
    rect: function() {},
    clip: function() {},
    measureText: function( text ) { return { width: text.length * 5 } },
    translate: function() {},
    strokeRect: function() {},
    scale: function() {},
    fillText: function() {},
    strokeText: function() {},
    stroke: function() {},
  };

  // Mock 'document.createElement()' to return a fake canvas.
  // This is a bit more convenient rather than requiring both the canvas
  // and jsdom node modules to be installed as well.
  global.document = {
    'createElement': function( name ) {
      if ( name === 'div' ) {
        return;
      } else if ( name === 'canvas' ) {
        return {
          name: 'canvas',
          width: null,
          height: null,
          getContext: function() { return context; },
        };
      }
      throw new Error(`This simple mock doesn't know element type ${ name }`);
    }
  };

  beforeEach( function() {
    this.sandbox = global.sinon.sandbox.create();
    global.stub = this.sandbox.stub.bind(this.sandbox);
    global.spy = this.sandbox.spy.bind(this.sandbox);
    global.mock = this.sandbox.mock.bind(this.sandbox);
  });

  afterEach( function() {
    delete global.stub;
    delete global.spy;
    delete global.mock;
    this.sandbox.restore();
  });
};
