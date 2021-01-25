/**
 * @file /src/module/index.js
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @fileoverview
 * This prepares the bundled module to be available for amd require,
 * esm import, or as a non-module script.
 */

/**
 * Replace this import with the import from your module.
 */
import { KDUIDManager } from './KDUIDManager';

/**
 * You'll also need to update the variables in this handler.
 * Replace `exports.template` with whatever you want the module to be called
 * (eg. `exports.myModuleName`) and set its value to the import object.
 */
const handleNonModule = function (exports) {
  exports.KDUIDManager = KDUIDManager;
};

/**
 * This is the namespace under which `window` will store the export
 * should the environment not support AMD or ES modules.
 */
const namespace = 'kd';

(function (declareExports) {
  const root = window;
  const rootDefine = root['define'];
  const amdRequire = root && typeof rootDefine === 'function' && rootDefine.amd;
  const esm = typeof module === 'object' && typeof exports === 'object';
  const nonmodule = root;

  /**
   * AMD / Require module
   * @example
   *  require(["dist/KDUIDManager.js"], function(KDUIDManager) {
   *    console.log( KDUIDManager );
   *  });
   */
  if (amdRequire) {
    root['define'](['exports'], declareExports);
    return;
  }

  /**
   * CommonJS / ES / Node module
   * @example
   *  import { KDUIDManager } from "./dist/KDUIDManager.js";
   *  console.log( KDUIDManager );
   */
  if (esm) {
    exports !== null && declareExports(exports);
    module !== null && (module.exports = exports);
    return;
  }

  /**
   * Non-module / CDN
   * @example
   *  <script src="dist/KDUIDManager.js"></script>
   *  <script>
   *    const KDUIDManager = window.kd.KDUIDManager;
   *    console.log( KDUIDManager );
   *  </script>
   */
  if (nonmodule) {
    declareExports((root[namespace] = root[namespace] || {}));
    return;
  }

  console.warn(
    'Unable to load as ES module. Use AMD, CJS, add an export, or use as non-module script.'
  );
})(handleNonModule);
