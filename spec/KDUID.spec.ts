/**
 * @file KDUID.spec.ts
 * @version 1.0.0
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview
 * Jest tests for KDUID.ts
 */

import { KDUID } from '../src/module/dev/KDUID';

const validUID = 'AA97B177-9383-4934-8543-0F91A7A02836';
const validHexNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const validHexLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
const validHexChars = [...validHexNumbers, ...validHexLetters];

/**
 * Use long form logic to check that a string is a RFC 4122 Version 4 unique identifier.
 *
 * - RFC 4122 Version 4 identifiers should include five segments separated by hyphens.
 * - The segment lengths should be `[8, 4, 4, 4, 12]` in that order and should only
 * include hexadecimal characters (0-9 or A-F).
 * - The four most significant bits of the 7th byte should be `0100'B`, so the first
 * character of the third segment is always `4`.
 * - The two most significant bits of the 9th byte should be `10'B`, so the first
 * character of the fourth segment is always one of `8`, `9`, `A`, or `B`.
 */
const longFormValidator = (uid: string) => {
  /**
   * Short regexp to ensure a segment comprises of only hexadecimal characters and
   * is of the the correct length.
   * @param {number} len - Expected length for the given segment.
   */
  const re = (len: number) => new RegExp(`^[0-9A-F]{${len}}$`, 'i');

  /**
   * Segments should be separated by hyphens `-`.
   */
  const arr: string[] = uid.split('-');

  /**
   * Five segments with their expected lengths.
   */
  const segs: ({ seg: string; len: number } | boolean)[] = [
    { seg: arr[0], len: 8 },
    { seg: arr[1], len: 4 },
    { seg: arr[2], len: 4 },
    { seg: arr[3], len: 4 },
    { seg: arr[4], len: 12 },
  ];

  /**
   * Segments one, two, and five should be of lengths `[8, 4, 12]` respectively, and
   * only need to be comprised of hexadecimal characters with no other requirements.
   */
  [0, 1, 4].forEach((index) => {
    const seg = segs[index] as { seg: string; len: number };
    segs[index] = re(seg.len).test(seg.seg);
  });

  /**
   * The third segment should be length `4`, comprised of hexadecimal characters, and
   * always begin with the character `4`.
   */
  segs[2] = (() => {
    const seg = segs[2] as { seg: string; len: number };
    const allHex = re(seg.len).test(seg.seg);
    const firstChar = seg.seg.split('')[0];
    const checkFirstChar = firstChar === '4';
    return allHex && checkFirstChar;
  })();

  /**
   * The fourth segment should be length `4`, comprised of hexadecimal characters, and
   * always begin with a character `8`, `9`, `A`, or `B`.
   */
  segs[3] = (() => {
    const seg = segs[3] as { seg: string; len: number };
    const allHex = re(seg.len).test(seg.seg);
    const firstChar = seg.seg.split('')[0];
    const checkFirstChar = ['8', '9', 'A', 'B']
      .map((char) => firstChar === char)
      .includes(true);
    return allHex && checkFirstChar;
  })();

  /**
   * Return `true` unless any segment failed its test.
   */
  return (() => {
    segs.forEach((seg) => {
      if (!(seg as boolean)) return false;
    });
    return true;
  })();
};

describe('uuid generator', () => {
  it(`should generate strings`, () => {
    const uuid = KDUID();
    expect(typeof uuid.generate()).toBe('string');
  });

  it(`should generate unique values given previously generated values`, () => {
    const uuid = KDUID();
    const uids: string[] = [...new Array(1000)].map(() => uuid.generate());
    const filtrd: string[] = uids.filter((v, i, self) => self.indexOf(v) === i);
    expect(filtrd.length).toBe(uids.length);
  });

  it(`should generate RFC4122 V4 compliant strings`, () => {
    const uuid = KDUID();
    const uid: string = uuid.generate();
    expect(longFormValidator(uid)).toBe(true);
  });

  describe(`RFC4122 V4 validator via regexp`, () => {
    describe(`passing cases`, () => {
      it(`should accept an array of valid strings`, () => {
        const uuid = KDUID();
        const uids: string[] = [...new Array(100)].map(() => uuid.generate());
        const validated: string[] = uuid.validate(uids);
        // should only include true values if all strings pass
        const longFormValidatedFailed: boolean = uids
          .map((uid) => longFormValidator(uid))
          .includes(false);
        // uuid.validate returns an array of valid strings
        expect(
          !longFormValidatedFailed && validated.length === uids.length
        ).toBe(true);
      });

      it(`should accept a single valid string`, () => {
        const uuid = KDUID();
        const uid: string = uuid.generate();
        const validated: string[] = uuid.validate(uid);
        const longFormValidated = longFormValidator(uid);
        // uuid.validate returns an array of valid strings regardless the input param
        expect(longFormValidated).toBe(true);
        expect(typeof validated[0]).toBe('string');
      });
    });

    describe(`failing cases`, () => {
      const uuid = KDUID();
      // control: should return an array containing the single valid uid
      expect(uuid.validate(validUID)[0]).toBe(validUID);

      it(`should fail if not separated by hyphens`, () => {
        const bad: string[] = [
          validUID.replace('-', '_'),
          validUID.replace('-', '+'),
          validUID.replace('-', ','),
          validUID.replace('-', '&'),
          validUID.replace('-', '^'),
          validUID.replace('-', '%'),
          validUID.replace('-', '*'),
          validUID.replace('-', '#'),
          validUID.replace('-', 'a'),
        ];
        bad.forEach((uid) => expect(uuid.validate(uid)).toHaveLength(0));
      });

      it(`should fail if not all hexadecimal characters`, () => {
        const bad: string[] = [
          validUID.replace('A', 'G'),
          validUID.replace('A', 'Z'),
          validUID.replace('A', '#'),
        ];
        bad.forEach((uid) => expect(uuid.validate(uid)).toHaveLength(0));
      });

      it(`should fail if first char of third segment is not 4`, () => {
        // invalid chars include non-hex chars and any hex char other than 4
        const invalidHexChars = [
          ...validHexChars.filter((char) => char !== '4'),
          'Z',
          'G',
        ];
        // replace the target char with each bad example and expect validator to return an empty array
        invalidHexChars.forEach((char) => {
          const uid: string[] = validUID.split('-');
          const thirdseg: string[] = uid[2].split('');
          thirdseg[0] = char;
          uid[2] = thirdseg.join('');
          const bad: string = uid.join('-');
          expect(uuid.validate(bad)).toHaveLength(0);
        });
      });

      it(`should fail if first char of fourth segment is not 8, 9, A, or B`, () => {
        // invalid chars include non-hex chars and any hex char other than 8, 9, A, or B
        const invalidHexChars = [
          ...validHexChars.filter((char) => {
            let pass = true;
            ['8', '9', 'A', 'B'].forEach((c) => {
              if (c === char) pass = false;
            });
            return pass;
          }),
          'Z',
          'G',
        ];
        // replace the target char with each bad example and expect validator to return an empty array
        invalidHexChars.forEach((char) => {
          const uid: string[] = validUID.split('-');
          const fourthseg: string[] = uid[3].split('');
          fourthseg[0] = char;
          uid[3] = fourthseg.join('');
          const bad: string = uid.join('-');
          expect(uuid.validate(bad)).toHaveLength(0);
        });
      });

      it(`should fail if segments are not the correct length`, () => {
        const uid: string[] = validUID.split('-');
        const lengths = [8, 4, 4, 4, 12];
        uid.forEach((segment, index) => {
          expect(segment.split('').length).toBe(lengths[index]);
        });
        uid.forEach((segment, index) => {
          expect(segment.split('').length !== lengths[index] + 1).toBe(true);
        });
      });
    });
  });

  it(`should return an array of previously generated values`, () => {
    const uuid = KDUID();
    const count = 1000;
    let counted = count;
    while (counted--) uuid.generate();
    const generated = uuid.getExisting();

    expect(generated.length).toBe(count);
    expect(uuid.validate(generated).length).toBe(count);
    generated.forEach((uid) => {
      expect(typeof uid).toBe('string');
      expect(longFormValidator(uid)).toBe(true);
    });
  });

  it(`should accept and set an array of previously generated values`, () => {
    const uuid = KDUID();
    const count = 1000;
    let counted = count;
    while (counted--) uuid.generate();
    const generated = uuid.getExisting();
    expect(generated.length).toBe(count);

    const uids = [validUID];
    uuid.setExisting(uids);
    const preExisting = uuid.getExisting();
    expect(preExisting.length).toBe(1);
    expect(preExisting[0]).toBe(validUID);

    uuid.setExisting([...generated]);
    expect(uuid.getExisting().length).toBe(count);
    expect(uuid.getExisting()[count - 1]).toBe(generated[count - 1]);
  });
});
