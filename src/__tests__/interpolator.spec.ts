import { fromString } from '../builder';
import { align, makeInterpolator } from '../interpolator';
import { getX, getY } from '../path-node';
import { lerp } from '../utils/math1d';

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

test('Interpolator test', () => {
  const interp = makeInterpolator(fromString(A), fromString(B));

  const a = interp(0)
  const b = interp(1);

  expect(a.length).toBe(b.length);
  for (let i = 0; i < a.length; i++) {
    expect(a[i].name).toBe(b[i].name);
  }

  for (let k = 1; k < 100; k++) {
    const t = k / 100;
    const c = interp(t);

    expect(b.length).toBe(c.length);
    for (let i = 0; i < c.length; i++) {
      expect(b[i].name).toBe(c[i].name);

      const ax = getX(a[i]);
      const bx = getX(b[i]);
      const cx = getX(c[i]);
      expect(cx).toBeCloseTo(lerp(ax, bx, t), 6);

      const ay = getY(a[i]);
      const by = getY(b[i]);
      const cy = getY(c[i]);
      expect(cy).toBeCloseTo(lerp(ay, by, t), 6);
    }
  }
});
