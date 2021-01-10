import { getCenterParams, getEllipsePoint } from '../arc-node';
import { fromString } from '../builder';
import { EllipticalArc, LineTo } from '../command';
import { getX, getY } from '../path-node';
import { canSplit, split } from '../splitter';

test('Split a line', () => {
  const N = 5;
  const L: LineTo = { name: 'L', x: 500, y: 500 };
  const S = split(L, N);

  expect(canSplit(L)).toBeTruthy();
  expect(S.length).toBe(N);
  for (let i = 0; i < N; i++) {
    expect(getX(S[i])).toBeCloseTo((L.x * (i + 1)) / N, 6);
    expect(getY(S[i])).toBeCloseTo((L.y * (i + 1)) / N, 6);
  }
});

test('Split an arc', () => {
  const N = 6;
  const A: EllipticalArc = {
    name: 'A',
    rx: 250,
    ry: 250,
    angle: 0,
    largeArcFlag: true,
    sweepFlag: true,
    x: 250,
    y: 250,
  };
  const S = split(A, N);

  const par = getCenterParams(A);

  expect(canSplit(A)).toBeTruthy();
  expect(S.length).toBe(N);
  for (let i = 0; i < N; i++) {
    const pt = getEllipsePoint(par, par.theta + (par.deltaTheta * (i + 1)) / N);

    expect(getX(S[i])).toBeCloseTo(pt.x, 6);
    expect(getY(S[i])).toBeCloseTo(pt.y, 6);
  }
});

test('An empty path could not be split', () => {
  const path = fromString('M0 0Z');
  for (const node of path) {
    expect(canSplit(node)).toBeFalsy();
    expect(split(node, 111).length).toBe(1);
  }
});
