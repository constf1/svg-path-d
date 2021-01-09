import { fromString } from '../builder';
import { align } from '../interpolator';

const A = 'M100 100t25-25h200t25 25v200l-25 25h-200l-25-25zm25 25v200h200v-200z';
const B = 'M100 250a50 25 0 00 100 0q-50-100-100 0';

test('Align test', () => {
  const path1 = fromString(A);
  const path2 = fromString(B);

  const [a, b] = align(path1, path2);
  const [c, d] = align(path2, path1);

  expect(a.length).toBe(b.length);
  expect(c.length).toBe(d.length);

  for (let i = 0; i < a.length; i++) {
    expect(a[i].name).toBe(b[i].name);
  }
  for (let i = 0; i < c.length; i++) {
    expect(c[i].name).toBe(d[i].name);
  }
});
