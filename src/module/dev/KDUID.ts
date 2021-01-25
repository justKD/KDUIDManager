/**
 * @file KDUID.ts
 * @version 1.0.0
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `export const KDUID`
 * Generate RFC4122 version 4 compliant unique identifiers using pseudo-random
 * values from `window.crypto` (with a fallback to `Math.Random`). A pre-generated
 * lookup table is used for performance optimization, and generated UUIDs are checked
 * against an array of previously generated UUIDs to ensure uniqueness.
 * @note Based on discussions found here:
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */

/**
 * Generate RFC4122 version 4 compliant unique identifiers using pseudo-random
 * values from `window.crypto` (with a fallback to `Math.Random`). A pre-generated
 * lookup table is used for performance optimization, and generated UUIDs are checked
 * against an array of previously generated UUIDs to ensure uniqueness.
 * @param {string[]} [uuids] - Pass an array of existing UUIDs to set/restore state.
 * @returns {{generate: () => string}}
 */
export const KDUID = (
  uuids?: string[]
): {
  /**
   * Determine which pseudo-random number generator to use, generate four random
   * values, and coerce the output to a RFC4122 version 4 compliant unique identifier.
   * Checks with stored UUIDs to absolutely ensure the value is unique.
   * @returns {string} RFC4122 version 4 compliant unique identifier as alpha-numeric `string`.
   */
  generate: () => string;

  /**
   * Retrieve the array of previously generated UUIDs.
   * @return {string[]} `string[]`
   */
  getExisting: () => string[];

  /**
   * Set the array of previously generated UUIDs. Checks the array for validity and only
   * sets the internal store if the check passes. Returns `true` on success and `false`
   * if failed.
   * @param {string[]} uuids - Array of existing UUIDs.
   * @returns {boolean} Returns `true` on success.
   */
  setExisting: (uuids: string[]) => void;

  /**
   * Validate as RFC4122 version 4 compliant unique identifier.
   * @param {string | string[]} uuids - Either a single string or array of strings to test.
   * @returns {string[]} Returns `string[]` containing all valid strings.
   *
   * @example `Single valid string`
   * const uid = uuid.generate();
   * const validated = uuid.validate(uid); // validated === [uid]
   * const isValid = validated.length > 0; // true
   *
   * @example `Array of valid strings`
   * const uids = [...new Array(5)].map((_) => uuid.generate());
   * const validated = uuid.validate(uids); // validated == uids
   * const isValid = validated.length === uids.length; // true
   *
   * @example `Array of invalid strings`
   * const uids = ['1', '2', '3', '4'];
   * const validated = uuid.validate(uids); // validated != uids
   * const isValid = validated.length === uids.length; // false
   *
   * @example `Array of mixed validity strings`
   * const uid = 'AA97B177-9383-4934-8543-0F91A7A02836';
   * const uids = ['invalid-uid', uid];
   * const validated = uuid.validate(uids); // validated == [uid]
   * const isValid = validated.length === uids.length; // false
   */
  validate: (uuids: string | string[]) => string[];
} => {
  let generated = uuids || [];

  /**
   * Lookup table holding 0-255 as hexadecimal numbers.
   */
  const lookup: string[] = Array(256)
    .fill(null)
    .map((_, i) => (i < 16 ? '0' : '') + i.toString(16));

  /**
   * Given an array of four random 32-bit unsigned integers, use the lookup table and
   * bitshift/bitwise operations to generate RFC4122 version 4 compliant unique identifier.
   * @param {[number, number, number, number]} values - Array holding four 32-bit unsigned integers.
   * @returns {string} - RFC4122 version 4 compliant unique identifier.
   */
  const formatUid = (values: [number, number, number, number]): string => {
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

  /**
   * Determine which prng to use and return an array of four 32-bit unsigned integers.
   * @returns {[number, number, number, number]}
   */
  const getRandomValues: () => [number, number, number, number] =
    window.crypto && window.crypto.getRandomValues
      ? () => {
          return Array.from(
            window.crypto.getRandomValues(new Uint32Array(4))
          ) as [number, number, number, number];
        }
      : () => {
          const rand = () => (Math.random() * 0x100000000) >>> 0;
          return [rand(), rand(), rand(), rand()];
        };

  const validator = (uuids: string | string[]): string[] => {
    const re = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const arr = Array.isArray(uuids) ? uuids : [uuids];
    return arr.filter((uid) => re.test(uid));
  };

  return {
    generate: (): string => {
      let uid = null;
      const gen = () => formatUid(getRandomValues());
      while (!uid || generated.includes(uid)) uid = gen();
      generated.push(uid);
      return uid;
    },
    getExisting: (): string[] => generated,
    setExisting: (uuids: string[]): boolean => {
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
