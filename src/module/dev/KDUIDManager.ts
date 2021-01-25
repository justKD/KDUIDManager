/**
 * @file KDUIDManager.ts
 * @version 1.1.0
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `export const KDUIDManager`
 * Generate and manage RFC4122 version 4 compliant unique identifiers
 * with associated objects. Checks internally to absolutely ensure all
 * identifiers are unique.
 */

import { KDUID } from './KDUID';

/**
 * Generate and manage RFC4122 version 4 compliant unique identifiers
 * with associated objects. Checks internally to absolutely ensure all
 * identifiers are unique.
 * @returns
 */
export const KDUIDManager = () => {
  let self = {
    generator: KDUID(),
    map: new Map(),
    /**
     * Update the list of previously generated UID strings held by the generator
     * with the current list held by the manager.
     */
    updateGenerator: () => {
      const uids = Array.from(self.map.values());
      return self.generator.setExisting(uids);
    },
  };

  const _self = {
    /**
     * Generate a unique identifier and associate it with the `target` entity.
     * Internally, these associations are stored in a `new Map()`. The target entity
     * is set as the key, and the UID string is set as the value. If the target entity
     * already exists in the map, the existing association is deleted and a new UID is
     * mapped to that entity.
     * @param {any} target - `any` entity to be mapped to a unique identifier.
     * @returns The generated UID `string`.
     */
    generateUIDFor: (target: any) => {
      const uid = self.generator.generate();
      if (self.map.has(target)) self.map.delete(target);
      self.map.set(target, uid);
      return uid;
    },

    /**
     * Check if there is an existing UID for the target object.
     * @param {any} target - The entity reference.
     * @returns {boolean}
     */
    hasUIDFor: (target: any): boolean => self.map.has(target),

    /**
     * Retrieve the UID string for the associated object.
     * @param {any} target - The entity reference.
     * @returns {string | undefined} Returns the UID `string` or `undefined` if
     * one doesn't exist.
     */
    getUIDFor: (target: any): string => self.map.get(target),

    /**
     * Check if there is an existing key for the associated UID string.
     * @param {string} uid - The UID string.
     * @returns {boolean}
     */
    hasKeyFor: (uid: string): boolean => {
      const uids = Array.from(self.map.values());
      for (let i in uids) {
        const value = uids[i];
        if (value === uid) return true;
      }
      return false;
    },

    /**
     * Retrieve the key for the associated UID string.
     * @param {string} uid - The UID string.
     * @returns {any} Returns the associated object or `undefined` if one doesn't exist.
     */
    getKeyFor: (uid: string): any => {
      const entries = Array.from(self.map.entries());
      for (let i in entries) {
        const [key, value] = entries[i];
        if (value === uid) return key;
      }
      return;
    },

    /**
     * Retrieve a new array containing all keys held in the map.
     * @returns An `array` holding all managed objects;
     */
    keys: (): any[] => Array.from(self.map.keys()),

    /**
     * Retrieve a new array containing all values (uids) held in the map.
     * @returns An `array` holding all of the `string` UIDs.
     */
    uids: (): string[] => Array.from(self.map.values()),

    /**
     * Retrieve a new array containing individual arrays `[entity, uid]` for each entry.
     * @returns An `array` holding all entries.
     */
    entries: (): [any, string][] => Array.from(self.map.entries()),

    /**
     * Clear all existing entries and set to the given list. If there are any duplicate
     * keys, this will replace the key entry with the latest UID. If a duplicate UID is
     * found, a new one will be generated for the given key.
     * @param {[any, string][]} entries - An `Array[any, string]` holding
     * the intended entries as key-value pairs `[any, string]`.
     * @returns An object `{ changed: [any, string][]; invalid: [any, any][] }`. `changed`
     * is an array holding any entries where the UID had to be changed, and `invalid` is
     * an array holding any entries that were not able to be added to the manager. Returns
     * `false` if unsuccessful the entire process was unsuccessful.
     */
    setEntries: (
      entries: [any, string][]
    ): { changed: [any, string][]; invalid: [any, any][] } | false => {
      if (Array.isArray(entries)) {
        try {
          const changed: [any, string][] = [];
          const invalid: [any, any][] = [];

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
        } catch {
          console.error('setEntries - error setting entries');
          return false;
        }
      } else {
        console.error('setEntries - entries must be an array');
        return false;
      }
    },

    /**
     * Delete a UID association for a given UID string.
     * @param {string} uid - The UID string.
     * @returns `true` if successful.
     */
    deleteEntryForUID: (uid: string): boolean => {
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

    /**
     * Delete a UID association for a given target.
     * @param {any} target - The entity reference.
     * @returns `true` if successful.
     */
    deleteEntryForKey: (target: any): boolean => {
      if (self.map.has(target)) {
        self.map.delete(target);
        self.updateGenerator();
        return true;
      }
      return false;
    },

    /**
     * Clear all currently held target:UID associations.
     */
    reset: () => {
      self.map.clear();
      self.updateGenerator();
    },
  };

  Object.freeze(_self);

  return _self;
};
