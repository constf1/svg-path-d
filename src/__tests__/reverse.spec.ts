import { asRelativeString, fromString } from '../builder';
import { createReversed } from '../reverse';

test('PathNode[] reverse .', () => {
  const data =
    'm-11-207c53 12 58 123 58 236s3 201 41 214h-121q31-259-56-411t36-87a25 18 0 11-25 18v32l38 19z' +
    'm118 359l29-21l38 19v32a25 18 0 10-25 18q123 65 36-87t-56-411h-121c38 13 41 100 41 214s5 224 58 236z';
  const paths = [fromString(data)];

  for (let i = 1; i <= 4 * 4; i++) {
    paths.push(createReversed(paths[i - 1]));
  }

  const strs = paths.map((path) => path.map((item) => asRelativeString(item, 3)).join(''));

  for (let i = paths.length; i-- > 3; ) {
    expect(paths[i].length).toBe(paths[i - 2].length);
    expect(strs[i]).toBe(strs[i - 2]);
  }
});
