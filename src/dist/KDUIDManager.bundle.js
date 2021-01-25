/**
 * @file KDUIDManager.bundle.js
 * @version 1.1.0
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `export const KDUIDManager`
 * Generate and manage RFC4122 version 4 compliant unique identifiers
 * with associated objects. Checks internally to absolutely ensure all
 * identifiers are unique.
 */

/**
 * Generate RFC4122 version 4 compliant unique identifiers using pseudo-random
 * values from `window.crypto` (with a fallback to `Math.Random`). A pre-generated
 * lookup table is used for performance optimization, and generated UUIDs are checked
 * against an array of previously generated UUIDs to ensure uniqueness.
 * @param {string[]} [uuids] - Pass an array of existing UUIDs to set/restore state.
 * @returns {{generate: () => string}}
 */
const KDUID = (uuids) => {
  let generated = uuids || [];
  const lookup = Array(256)
    .fill(null)
    .map((_, i) => (i < 16 ? '0' : '') + i.toString(16));
  const formatUid = (values) => {
    const v = [
      lookup[values[0] & 0xff],
      lookup[(values[0] >> 8) & 0xff],
      lookup[(values[0] >> 16) & 0xff],
      lookup[(values[0] >> 24) & 0xff],
      lookup[values[1] & 0xff],
      lookup[(values[1] >> 8) & 0xff],
      lookup[((values[1] >> 16) & 0x0f) | 0x40],
      lookup[(values[1] >> 24) & 0xff],
      lookup[(values[2] & 0x3f) | 0x80],
      lookup[(values[2] >> 8) & 0xff],
      lookup[(values[2] >> 16) & 0xff],
      lookup[(values[2] >> 24) & 0xff],
      lookup[values[3] & 0xff],
      lookup[(values[3] >> 8) & 0xff],
      lookup[(values[3] >> 16) & 0xff],
      lookup[(values[3] >> 24) & 0xff],
    ];
    const s = [
      `${v[0]}${v[1]}${v[2]}${v[3]}`,
      `${v[4]}${v[5]}`,
      `${v[6]}${v[7]}`,
      `${v[8]}${v[9]}`,
      `${v[10]}${v[11]}${v[12]}${v[13]}${v[14]}${v[15]}`,
    ];
    const uuid = `${s[0]}-${s[1]}-${s[2]}-${s[3]}-${s[4]}`;
    return uuid;
  };
  const getRandomValues =
    window.crypto && window.crypto.getRandomValues
      ? () => {
          return Array.from(window.crypto.getRandomValues(new Uint32Array(4)));
        }
      : () => {
          const rand = () => (Math.random() * 0x100000000) >>> 0;
          return [rand(), rand(), rand(), rand()];
        };
  const validator = (uuids) => {
    const re = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const arr = Array.isArray(uuids) ? uuids : [uuids];
    return arr.filter((uid) => re.test(uid));
  };
  return {
    generate: () => {
      let uid = null;
      const gen = () => formatUid(getRandomValues());
      while (!uid || generated.includes(uid)) uid = gen();
      generated.push(uid);
      return uid;
    },
    getExisting: () => generated,
    setExisting: (uuids) => {
      const validated = validator(uuids);
      if (validated.length === uuids.length) {
        generated = uuids;
        return true;
      } else {
        return false;
      }
    },
    validate: validator,
  };
};

/**
 * Generate and manage RFC4122 version 4 compliant unique identifiers
 * with associated objects. Checks internally to absolutely ensure all
 * identifiers are unique.
 * @returns
 */
const KDUIDManager = () => {
  let self = {
    generator: KDUID(),
    map: new Map(),
    updateGenerator: () => {
      const uids = Array.from(self.map.values());
      return self.generator.setExisting(uids);
    },
  };
  const _self = {
    generateUIDFor: (target) => {
      const uid = self.generator.generate();
      if (self.map.has(target)) self.map.delete(target);
      self.map.set(target, uid);
      return uid;
    },
    hasUIDFor: (target) => self.map.has(target),
    getUIDFor: (target) => self.map.get(target),
    hasKeyFor: (uid) => {
      const uids = Array.from(self.map.values());
      for (let i in uids) {
        const value = uids[i];
        if (value === uid) return true;
      }
      return false;
    },
    getKeyFor: (uid) => {
      const entries = Array.from(self.map.entries());
      for (let i in entries) {
        const [key, value] = entries[i];
        if (value === uid) return key;
      }
      return;
    },
    keys: () => Array.from(self.map.keys()),
    uids: () => Array.from(self.map.values()),
    entries: () => Array.from(self.map.entries()),
    setEntries: (entries) => {
      if (Array.isArray(entries)) {
        try {
          const changed = [];
          const invalid = [];
          self.map.clear();
          entries.forEach((entry) => {
            const [key, uid] = entry;
            const isValidUID = self.generator.validate(uid);
            const handleValid = () => {
              const uidExists = _self.uids().includes(uid);
              if (uidExists) changed.push([key, _self.generateUIDFor(key)]);
              else self.map.set(key, uid);
            };
            if (!isValidUID) invalid.push(entry);
            else handleValid();
          });
          self.updateGenerator();
          return { changed: changed, invalid: invalid };
        } catch (_a) {
          console.error('setEntries - error setting entries');
          return false;
        }
      } else {
        console.error('setEntries - entries must be an array');
        return false;
      }
    },
    deleteEntryForUID: (uid) => {
      const entries = Array.from(self.map.entries());
      if (entries.length) {
        for (let i in entries) {
          const [key, value] = entries[i];
          if (value === uid) {
            self.map.delete(key);
            self.updateGenerator();
            return true;
          }
        }
      }
      return false;
    },
    deleteEntryForKey: (target) => {
      if (self.map.has(target)) {
        self.map.delete(target);
        self.updateGenerator();
        return true;
      }
      return false;
    },
    reset: () => {
      self.map.clear();
      self.updateGenerator();
    },
  };
  Object.freeze(_self);
  return _self;
};

const handleNonModule = function (exports) {
  exports.KDUIDManager = KDUIDManager;
};
const namespace = 'kd';
(function (declareExports) {
  const root = window;
  const rootDefine = root['define'];
  const amdRequire = root && typeof rootDefine === 'function' && rootDefine.amd;
  const esm = typeof module === 'object' && typeof exports === 'object';
  const nonmodule = root;
  if (amdRequire) {
    root['define'](['exports'], declareExports);
    return;
  }
  if (esm) {
    exports !== null && declareExports(exports);
    module !== null && (module.exports = exports);
    return;
  }
  if (nonmodule) {
    declareExports((root[namespace] = root[namespace] || {}));
    return;
  }
  console.warn(
    'Unable to load as ES module. Use AMD, CJS, add an export, or use as non-module script.'
  );
})(handleNonModule);
