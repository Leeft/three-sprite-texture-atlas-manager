/**
The main entry point for 'global' mode, to be used when you're not able to use `require();` or ES6 modules to load the functionality of this library. Include the library by loading the JavaScript directly, or combine it with your other code, and then do:

```javascript
// Instantiate a new TextureManager with 512x512 textures
var textureManager = new window.threeSpriteAtlasTextureManager( 512 );
```
* @namespace threeSpriteAtlasTextureManager
* @constructor
* @global
* @param {integer} [size=1024] Optional size for the textures. Must be a power of two.
*/

import TextureManager from './texture-manager';
export default TextureManager;
