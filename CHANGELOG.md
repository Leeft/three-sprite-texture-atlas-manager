### [0.0.1](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.0.1)

- The first release

### [0.0.2](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.0.2)

- Build/release process/documentation fixes

### [0.0.3](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.0.3)

- Build/release process/documentation fixes

### [0.0.4](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.0.4)

- Build/release process/documentation fixes

### [0.0.5](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.0.5)

- Documentation greatly improved.
- Module structure revised.
- Published the API documentation as [the API reference](docs/API.md).
- Added development notes to [README.md](README.md).
- Configuration tweaked to speed up Travis CI build time.

### [0.0.6](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.0.6)

- v0.0.5 broke the build due to a 'use strict' in the gulpfile, fixed.

### [0.1.0](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.1.0)

Build packager finally switched from Esperanto to Rollup, as Esperanto is end of life. That now enables a more advanced build:

- ES6 module included as `dist/three-sprite-texture-atlas-manager.es6.js`.
- UMD module locations moved to `dist/three-sprite-texture-atlas-manager.umd.js` and `three-sprite-texture-atlas-manager.umd.min.js`.

If you were using this library already, you'll need to update the path if you were using the old one.
