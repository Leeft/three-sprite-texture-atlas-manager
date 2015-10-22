var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.threeSpriteAtlasTextureManager = factory();
})(this, function () {
  'use strict';

  /*
   * Helper classes to generate a texture map for sprites of various sizes.
   *
   * Simple class to describe a rectangular area witin the knapsack.
   */

  var KnapsackRectangle = (function () {
    function KnapsackRectangle(left, top, right, bottom) {
      _classCallCheck(this, KnapsackRectangle);

      this.left = Math.floor(typeof left === 'number' && isFinite(left) ? left : 0);
      this.top = Math.floor(typeof top === 'number' && isFinite(top) ? top : 0);
      this.right = Math.floor(typeof right === 'number' && isFinite(right) ? right : 0);
      this.bottom = Math.floor(typeof bottom === 'number' && isFinite(bottom) ? bottom : 0);
    }

    /*
     * Represents a single texture "node" within a larger texture atlas.
     *
     * Based on: http://www.blackpawn.com/texts/lightmaps/default.html
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
  })();

  var KnapsackNode = (function () {
    function KnapsackNode(knapsack) {
      _classCallCheck(this, KnapsackNode);

      this.knapsack = knapsack;
      this.leftChild = null;
      this.rightChild = null;
      this.rectangle = null;
      this.imageID = null;
      this._texture = null;

      // This is overwritten when children are created, but done
      // as a default here to keep the code cleaner. Instantiating
      // this object is pretty cheap anyway.
      this.rectangle = new KnapsackRectangle(0, 0, knapsack.textureSize, knapsack.textureSize);
    }

    /*
     * Helper classes to generate a texture map for sprites of various sizes.
     *
     * Represents a single texture atlas and canvas
     *
     * Based on: http://www.blackpawn.com/texts/lightmaps/default.html
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

      // Clear the area of the node
    }, {
      key: 'clear',
      value: function clear() {
        this.context.clearRect(this.rectangle.left, this.rectangle.top, this.width - 1, this.height - 1);
      }

      // Set the context to the centre of the node, and make sure to clip anything
      // outside of the node; this makes it easier to draw in it
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

      // Restore the context of the canvas, call this when done drawing the sprite.
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

      // "Allocate" the node by giving it a (unique) ID for an image,
      // this prevents it from being used for another image.
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
          var uvExtremes = this.uvCoordinates();
          this.texture.offset.x = uvExtremes[0];
          this.texture.offset.y = uvExtremes[1];
          this.texture.repeat.x = uvExtremes[2] - uvExtremes[0];
          this.texture.repeat.y = uvExtremes[3] - uvExtremes[1];
        }
        return this._texture;
      }
    }]);

    return KnapsackNode;
  })();

  var Knapsack = (function () {
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

    /*
     * Manages the texture canvas(es) for the system labels using the Knapsack class
     */

    // Lazily build the canvas

    _createClass(Knapsack, [{
      key: 'allocateNode',

      // Method proxy, adds the given size to the bag if possible
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

      // Each node will .clone() this for itself
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
  })();

  var TextureManager = (function () {
    function TextureManager(scene, size) {
      _classCallCheck(this, TextureManager);

      this.scene = scene;
      this.size = typeof size === 'number' && /^(128|256|512|1024|2048|4096|8192|16384)$/.test(size) ? size : 1024;
      this.knapsacks = [];
      this.debug = false;
    }

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
      key: 'allocateNode',

      // Claim a texture atlas slot for an image of width x height pixels,
      // will create a new texture atlas if needed.
      // Returns a Promise.
      value: function allocateNode(width, height) {
        var self = this;

        return new Promise(function (resolve, reject) {
          var node = undefined;

          // Prevent allocating knapsacks when there's no chance to fit the node
          // FIXME TODO: try a bigger texture size if it doesn't fit?
          if (width > self.textureSize) {
            reject(Error('A width of ' + width + ' is too large for these textures'));
            return;
          }

          if (height > self.textureSize) {
            reject(Error('A height of ' + height + ' is too large for these textures'));
            return;
          }

          if (!self.knapsacks.length) {
            self._addKnapsack(self.size);
          }

          // First try to get a node from the existing knapsacks
          self.knapsacks.forEach(function (knapsack) {
            if (node === null || node === undefined) {
              node = knapsack.allocateNode(width, height);
            }
          });

          // If we didn't get a node here, but it should fit in a knapsack
          // of the same size, so we can allocate a new knapsack
          if (node === null && width <= self.textureSize) {
            // Didn't get a node yet but it *should* fit, so make a new texture atlas with the same size
            var knapsack = self._addKnapsack(self.textureSize);
            node = knapsack.allocateNode(width, height);
          }

          if (node === null || node === undefined) {
            reject(Error('Could not allocate a node of size ' + width + 'x' + height));
          } else {
            resolve(node);
          }
        });
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
  })();

  var three_sprite_texture_atlas_manager = TextureManager;

  return three_sprite_texture_atlas_manager;
});
//# sourceMappingURL=three-sprite-texture-atlas-manager.js.map
