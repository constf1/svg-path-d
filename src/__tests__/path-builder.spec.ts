import { fromString, asRelativeString, getParams } from '../builder';
import { getTokens } from '../parser';
import { PathBuilder } from '../path-builder';
import { getX, getY } from '../path-node';

type Builder = {
  [key: string]: ((...args: number[]) => void) | undefined;
};

test('PathBuilder Class.', () => {
  const data =
    'M-11-291c53 17 58 173 58 333s3 283 41 301h-121q31-365-56-579t36-122a25 25 0 11-25 25v45l38 27z' +
    'm120 0l-29 30l-38-27v-45a25 25 0 10 25-25q-123-92-36 122t56 579h121c-38-18-41-141-41-301s-5-316-58-333z';
  const path1 = fromString(data);

  const path2 = new PathBuilder()
    .M(-11, -291)
    .c(53, 17, 58, 173, 58, 333)
    .s(3, 283, 41, 301)
    .h(-121)
    .q(31, -365, -56, -579)
    .t(36, -122)
    .a(25, 25, 0, 1, 1, -25, 25)
    .v(45)
    .l(38, 27)
    .z()
    .m(120, 0)
    .l(-29, 30)
    .l(-38, -27)
    .v(-45)
    .a(25, 25, 0, 1, 0, 25, -25)
    .q(-123, -92, -36, 122)
    .t(56, 579)
    .h(121)
    .c(-38, -18, -41, -141, -41, -301)
    .s(-5, -316, -58, -333)
    .z().path;

  const maker = new PathBuilder();
  for (const token of getTokens(data)) {
    const name = token.relative ? token.name.toLowerCase() : token.name;
    const func = ((maker as unknown) as Builder)[name];

    expect(typeof func).toBe('function');
    if (typeof func === 'function') {
      func.apply(
        maker,
        token.args.map((value) => +value)
      );
    }
  }
  const path3 = maker.path;

  const str1 = path1.map((item) => asRelativeString(item, 2)).join('');
  const str2 = path2.map((item) => asRelativeString(item, 2)).join('');
  const str3 = path3.map((item) => asRelativeString(item, 2)).join('');

  expect(str1).toBe(str2);
  expect(str2).toBe(str3);
  expect(path1.length).toBeGreaterThan(1);
  expect(path2.length).toBe(path1.length);

  if (path1.length === path2.length) {
    for (let i = 0; i < path1.length; i++) {
      expect(path1[i].name).toBe(path2[i].name);

      expect(getX(path1[i])).toBeCloseTo(getX(path2[i]), 6);
      expect(getY(path1[i])).toBeCloseTo(getY(path2[i]), 6);

      const buf1: number[] = [];
      getParams(path1[i], buf1);
      const buf2: number[] = [];
      getParams(path2[i], buf2);
      expect(buf1.length).toBe(buf2.length);
      for (let i = 0; i < buf1.length; i++) {
        expect(buf1[i]).toBeCloseTo(buf2[i], 6);
      }
    }
  }
});
