(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('three-sprite-atlas-texture-manager', ['module', 'exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.threeSpriteAtlasTextureManager = mod.exports;
  }
})(this, function (module, exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  (function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.threeSpriteAtlasTextureManager = factory();
  })(undefined, function () {
    'use strict';

    /**
    Describes a rectangular area witin the knapsack. Abstracts the basic math away from the {@link module:texture-manager/knapsack/node|`KnapsackNode`} module.
    
    @module texture-manager/knapsack/rectangle
    */

    /**
     * @constructor
     * @param {integer} left - Left most pixel index of this rectangle (0 to `right` - 1 )
     * @param {integer} top - Top most pixel index of this rectangle (0 to `bottom` - 1 )
     * @param {integer} right - Right most pixel index of this rectangle
     * @param {integer} bottom - Bottom most pixel index of this rectangle
    */

    var KnapsackRectangle = function () {
      function KnapsackRectangle(left, top, right, bottom) {
        _classCallCheck(this, KnapsackRectangle);

        this.left = Math.floor(typeof left === 'number' && isFinite(left) ? left : 0);
        this.top = Math.floor(typeof top === 'number' && isFinite(top) ? top : 0);
        this.right = Math.floor(typeof right === 'number' && isFinite(right) ? right : 0);
        this.bottom = Math.floor(typeof bottom === 'number' && isFinite(bottom) ? bottom : 0);
      }

      /**
       * The center X coordinate of this rectangle.
       * @type {integer}
       * @readonly
       */


      _createClass(KnapsackRectangle, [{
        key: 'Xcentre',
        get: function get() {
          return Math.floor((this.right - this.left) / 2 + this.left) - 0.5;
        }
      }, {
        key: 'Ycentre',
        get: function get() {
          return Math.floor((this.bottom - this.top) / 2 + this.top) - 0.5;
        }
      }, {
        key: 'width',
        get: function get() {
          return this.right - this.left;
        }
      }, {
        key: 'height',
        get: function get() {
          return this.bottom - this.top;
        }
      }]);

      return KnapsackRectangle;
    }();

    var KnapsackNode = function () {
      function KnapsackNode(knapsack) {
        _classCallCheck(this, KnapsackNode);

        /**
         * Reference to the {@link module:texture-manager/knapsack|`Knapsack`} this node is a part of
         * @type {Knapsack}
         * @private
         * @readonly
         * @category provider
         */
        this.knapsack = knapsack;

        /**
         * Optional reference to the "left" side {@link module:texture-manager/knapsack/node|`KnapsackNode`} branch of the tree of nodes.
         * @type {KnapsackNode}
         * @private
         * @readonly
         * @category provider
         */
        this.leftChild = null;

        /**
         * Optional reference to the "right" side {@link module:texture-manager/knapsack/node|`KnapsackNode`} branch of the tree of nodes.
         * @type {KnapsackNode}
         * @private
         * @readonly
         * @category provider
         */
        this.rightChild = null;

        /**
         * Describes the coordinates which are the boundaries of this node.
         * @type {KnapsackRectangle}
         * @private
         * @readonly
         * @category information
         */
        this.rectangle = null;
        // Overwritten when children are created, but done as a default here to keep
        // the code cleaner. Instantiating this object is pretty cheap anyway.
        this.rectangle = new KnapsackRectangle(0, 0, knapsack.textureSize, knapsack.textureSize);

        /**
         * Internal unique ID for the image this node represents.
         * @type {string}
         * @private
         * @readonly
         * @category information
         */
        this.imageID = null;

        this._texture = null;
      }

      /**
       * The HTML `<canvas>` element as supplied by the {@link module:texture-manager/knapsack|`Knapsack`} which this node is part of.
       * @type {external:canvas}
       * @readonly
       * @category provider
       */


      _createClass(KnapsackNode, [{
        key: 'hasChildren',
        value: function hasChildren() {
          return this.leftChild !== null || this.rightChild !== null;
        }
      }, {
        key: 'isOccupied',
        value: function isOccupied() {
          return this.imageID !== null;
        }
      }, {
        key: 'uvCoordinates',
        value: function uvCoordinates() {
          var size = this.knapsack.textureSize;
          return [this.rectangle.left / size, 1 - this.rectangle.bottom / size, this.rectangle.right / size, 1 - this.rectangle.top / size];
        }
      }, {
        key: 'release',
        value: function release() {
          if (this.hasChildren()) {
            throw new Error('Can not release tree node, still has children');
          }

          if (this._texture !== null) {
            this._texture.dispose();
            this._texture = null;
          }

          this.clear();
          this.imageID = null;

          return;
        }
      }, {
        key: 'clear',
        value: function clear() {
          this.context.clearRect(this.rectangle.left, this.rectangle.top, this.width - 1, this.height - 1);
        }
      }, {
        key: 'clipContext',
        value: function clipContext() {
          var ctx = this.context;
          ctx.save();
          ctx.beginPath();
          ctx.rect(this.rectangle.left + 1, this.rectangle.top + 1, this.width - 2, this.height - 2);
          ctx.clip();
          ctx.translate(this.rectangle.Xcentre, this.rectangle.Ycentre);
          return ctx;
        }
      }, {
        key: 'restoreContext',
        value: function restoreContext() {
          this.context.restore();
        }
      }, {
        key: 'allocate',
        value: function allocate(width, height) {
          // If we're not a leaf node
          if (this.hasChildren()) {
            // then try inserting into our first child
            var newNode = this.leftChild.allocate(width, height);
            if (newNode instanceof KnapsackNode) {
              newNode.claim();
              return newNode;
            }

            // There was no room: try to insert into second child
            return this.rightChild.allocate(width, height);
          } else {
            // if there's already an image here, return
            if (this.isOccupied()) {
              return null;
            }

            // if this node is too small, give up here
            if (width > this.width || height > this.height) {
              return null;
            }

            // if we're just the right size, accept
            if (width === this.width && height === this.height) {
              this.claim();
              return this;
            }

            // otherwise, got to split this node and create some kids
            this.leftChild = new KnapsackNode(this.knapsack);
            this.rightChild = new KnapsackNode(this.knapsack);

            // now decide which way to split
            var remainingWidth = this.width - width;
            var remainingHeight = this.height - height;

            if (remainingWidth > remainingHeight) {
              // horizontal split
              this.leftChild.rectangle = new KnapsackRectangle(this.rectangle.left, this.rectangle.top, this.rectangle.left + width, this.rectangle.bottom);

              this.rightChild.rectangle = new KnapsackRectangle(this.rectangle.left + width, this.rectangle.top, this.rectangle.right, this.rectangle.bottom);
            } else {
              // vertical split
              this.leftChild.rectangle = new KnapsackRectangle(this.rectangle.left, this.rectangle.top, this.rectangle.right, this.rectangle.top + height);

              this.rightChild.rectangle = new KnapsackRectangle(this.rectangle.left, this.rectangle.top + height, this.rectangle.right, this.rectangle.bottom);
            }

            // Some crude painting to help troubleshooting
            if (this.knapsack.textureManager.debug) {
              var context = this.context;
              context.lineWidth = 4.0;
              context.strokeStyle = 'rgba(255,0,0,1)';
              context.strokeRect(this.leftChild.rectangle.left, this.leftChild.rectangle.top, this.leftChild.width, this.leftChild.height);

              context.lineWidth = 4.0;
              context.strokeStyle = 'rgba(0,255,0,1)';
              context.strokeRect(this.rightChild.rectangle.left, this.rightChild.rectangle.top, this.rightChild.width, this.rightChild.height);
            }

            // Recurse into the first child to continue the allocation
            return this.leftChild.allocate(width, height);
          }
        }
      }, {
        key: 'claim',
        value: function claim() {
          this.imageID = THREE.Math.generateUUID();

          // Some crude painting to help troubleshooting
          if (this.knapsack.textureManager.debug) {
            var context = this.context;
            context.lineWidth = 2.0;
            context.strokeStyle = 'rgba( 0, 0, 255, 1 )';
            context.strokeRect(this.rectangle.left + 0.5, this.rectangle.top + 0.5, this.width - 1, this.height - 1);
          }
        }
      }, {
        key: 'canvas',
        get: function get() {
          return this.knapsack.canvas;
        }
      }, {
        key: 'context',
        get: function get() {
          return this.knapsack.canvas.getContext('2d');
        }
      }, {
        key: 'width',
        get: function get() {
          return this.rectangle.width;
        }
      }, {
        key: 'height',
        get: function get() {
          return this.rectangle.height;
        }
      }, {
        key: 'texture',
        get: function get() {
          if (!this._texture) {
            this._texture = this.knapsack.rootTexture.clone();
            this._texture.uuid = this.knapsack.rootTexture.uuid;
            var uvs = this.uvCoordinates();
            this.texture.offset.x = uvs[0];
            this.texture.offset.y = uvs[1];
            this.texture.repeat.x = uvs[2] - uvs[0];
            this.texture.repeat.y = uvs[3] - uvs[1];
          }
          return this._texture;
        }
      }]);

      return KnapsackNode;
    }();

    var Knapsack = function () {
      function Knapsack(textureManager, size) {
        _classCallCheck(this, Knapsack);

        this.textureManager = textureManager;
        this.textureSize = size;
        this.textureLoaded = false;
        this.rootNode = new KnapsackNode(this);
        // Lazy initialising these:
        this._rootTexture = null;
        this._canvas = null;
      }

      /**
       * Lazily built HTML `<canvas>` element for this `Knapsack`.
       * @type {external:canvas}
       * @readonly
       */


      _createClass(Knapsack, [{
        key: 'allocateNode',
        value: function allocateNode(width, height) {
          return this.rootNode.allocate(width, height);
        }
      }, {
        key: 'canvas',
        get: function get() {
          if (!this._canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.width = this.textureSize;
            this._canvas.height = this.textureSize;
          }
          return this._canvas;
        }
      }, {
        key: 'rootTexture',
        get: function get() {
          if (!this._rootTexture) {
            this._rootTexture = new THREE.Texture(this.canvas, THREE.UVMapping);
          }
          return this._rootTexture;
        }
      }]);

      return Knapsack;
    }();

    var TextureManager = function () {
      function TextureManager(size) {
        _classCallCheck(this, TextureManager);

        /**
         * The size of the textures as was validated when constructing the object.
         * @namespace module:texture-manager~TextureManager#size
         * @type {integer}
         * @ignore
         * @category readonly
         */
        this.size = typeof size === 'number' && /^(128|256|512|1024|2048|4096|8192|16384)$/.test(size) ? size : 1024;

        /**
         * As the texture manager allocates nodes, it creates a new {@link module:texture-manager/knapsack|`Knapsack`} when it needs to provide space for nodes. This is an array with all the knapsacks which have been created.
         * @namespace module:texture-manager~TextureManager#knapsacks
         * @type {Knapsack[]}
         * @readonly
         * @category readonly
         * @example
         * // Show the canvases in the DOM element with id="canvases"
         * // (you'd normally do this from the browser console)
         * textureManager.knapsacks.forEach( function( knapsack ) {
         *   document.getElementById('canvases').appendChild( knapsack.canvas );
         * });
         */
        this.knapsacks = [];

        /**
         * The debug property can be set to `true` after instantiating the object, which will make the {@link module:texture-manager/knapsack/node|`KnapsackNode`} class draw outlines as it allocates nodes. This can make it much more obvious what is going on, such as whether your text is properly sized and centered.
         * @namespace module:texture-manager~TextureManager#debug
         * @type {boolean}
         * @example
         * textureManager.debug = true;
         */
        this.debug = false;
      }

      /**
       * Add a new knapsack to the texture manager.
       * @param {integer} size
       * @returns {Knapsack}
       * @ignore
       */


      _createClass(TextureManager, [{
        key: '_addKnapsack',
        value: function _addKnapsack(size) {
          var knapsack = new Knapsack(this, size);
          this.knapsacks.push(knapsack);
          if (this.debug) {
            console.log('TextureManager: allocated ' + this.textureSize + 'px texture map #' + this.knapsacks.length);
          }
          return knapsack;
        }
      }, {
        key: 'allocate',
        value: function allocate(width, height) {
          // Prevent allocating knapsacks when there's no chance to fit the node
          // FIXME TODO: try a bigger texture size if it doesn't fit?
          this._validateSize(width, height);
          return this._allocate(width, height);
        }
      }, {
        key: 'allocateNode',
        value: function allocateNode(width, height) {
          var _this = this;

          return new Promise(function (resolve, reject) {
            try {
              // Prevent allocating knapsacks when there's no chance to fit the node
              // FIXME TODO: try a bigger texture size if it doesn't fit?
              _this._validateSize(width, height);
              resolve(_this._allocate(width, height));
            } catch (error) {
              reject(error);
            }
          });
        }
      }, {
        key: 'allocateASync',
        value: function allocateASync(width, height) {
          var _this2 = this;

          if (!Array.isArray(this._queue)) {
            this._queue = [];
          }

          var queueEntry = void 0;

          var promise = new Promise(function (resolve, reject) {
            try {
              // Prevent allocating knapsacks when there's no chance to fit the node
              // FIXME TODO: try a bigger texture size if it doesn't fit?
              _this2._validateSize(width, height);
              // Queue our resolution, which will be settled with .solveASync()
              queueEntry = {
                resolve: resolve,
                reject: reject,
                width: width,
                height: height
              };
            } catch (error) {
              reject(error);
            }
          });

          if (queueEntry) {
            queueEntry.promise = promise;
            this._queue.push(queueEntry);
          }

          return promise;
        }
      }, {
        key: 'solveASync',
        value: function solveASync() {
          var _this3 = this;

          /*eslint no-unused-vars: 0*/
          if (!Array.isArray(this._queue)) {
            throw new Error('You\'re trying to resolve a queue which hasn\'t been set up. Call allocateASync before using this.');
          }

          var promises = [];

          this._queue.forEach(function (entry) {
            var promise = entry.promise;
            var resolve = entry.resolve;
            var reject = entry.reject;
            var width = entry.width;
            var height = entry.height;

            var node = _this3._allocate(width, height);
            resolve(node);
            promises.push(promise);
          });

          this._queue = [];

          return Promise.all(promises);
        }
      }, {
        key: '_validateSize',
        value: function _validateSize(width, height) {
          if (width > this.textureSize) {
            throw new Error('Width of ' + width + ' is too large for these textures');
          }

          if (height > this.textureSize) {
            throw new Error('Height of ' + height + ' is too large for these textures');
          }
        }
      }, {
        key: '_allocate',
        value: function _allocate(width, height) {
          var node = null;

          // First try to get a node from the existing knapsacks
          this.knapsacks.forEach(function (knapsack) {
            if (node === null || node === undefined) {
              node = knapsack.allocateNode(width, height);
            }
          });

          // Didn't get a node yet but it *should* fit, so make a new texture atlas with the same size
          if (node === null) {
            var knapsack = this._addKnapsack(this.textureSize);
            node = knapsack.allocateNode(width, height);
          }

          return node;
        }
      }, {
        key: 'release',
        value: function release(node) {
          if (node) {
            node.release();
          }
        }
      }, {
        key: 'textureSize',
        get: function get() {
          return this.size;
        }
      }]);

      return TextureManager;
    }();

    return TextureManager;
  });
});
//# sourceMappingURL=three-sprite-texture-atlas-manager.umd.js.map
