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

Build packager finally switched from Esperanto to Rollup, as Esperanto is end of life. This enables a slightly more advanced build:

- New ES6 module library included as `dist/three-sprite-texture-atlas-manager.es6.js`.
- UMD module locations moved to `dist/three-sprite-texture-atlas-manager.umd.js` and `three-sprite-texture-atlas-manager.umd.min.js`.

If you were using this library before v0.1.0 and you specified the path manually somewhere, you'll have to change that.

### [0.1.1](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.1.1)

- Tests expanded
- New methods: `allocate()`, and `allocateASync()`/`solveASync()`. The first is a simpler synchronous version of `allocateNode` which returns its result instantly; use of the latter two allow the layout engine to batch process the allocations, and that enables the knapsack algorithm to optimise the allocation. See [the API reference](docs/API.md) for the interface.
- Internals reworked a bit to make the new methods share as much code as possible.

### [0.2.0](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.2.0)

No functional changes since 0.1.3 (which I've neglected to document it seems).

- Build system updated: latest babel, rollup modules, etc.
- Stricter linting.
- Any warnings from my build system eliminated.
- Made sure all tests are working, no warnings or pending tests are left now.

### [0.2.1](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.2.1)

- Removed obsolete (and failing build due to a `const`) travis CI build of node 0.10

### [0.2.2](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.2.2)

- Fixed UMD build, `new window.threeSpriteAtlasTextureManager(1024);` works yet again (was broken as of 0.2.0).
- README updates:
    - three.js Sprite example added.
    - Asynchronous and synchronous modes mentioned.
    - Clarified (hopefully) that IE11 only needs Promises when asynchronous allocation calls are used.

### [0.3.0](https://github.com/Leeft/three-sprite-texture-atlas-manager/releases/tag/v0.3.0)

Security update for the build process.

- No functional changes in the library.
- Build process overhauled, even more integration of ES2015+ features from node and tooling.
- Now using all latest versions of packages; packages deemed a security problem removed or updated (particularly three.js).
- Removed travis, can't be bothered setting up a different CI.

If you're simply a user of this package none of this is likely to affect you (particularly in the ES2015+/ES6 build) as my library is standalone and uses none of these directly; it's up to you to include three.js yourself.
