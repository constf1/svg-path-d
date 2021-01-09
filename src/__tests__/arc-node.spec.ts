import { getCenterParams, getEllipsePoint } from '../arc-node';
import { fromString } from '../builder';
import { isEllipticalArc, isMoveTo } from '../command-assertion';
import { getX, getY } from '../path-node';

test('Elliptical Arc Nodes', () => {
  const d='M200 200A100 100-45 01 300 100';
  const path = fromString(d);
  const m = path[0];
  const a = path[1];

  expect(path.length).toBe(2);
  expect(isMoveTo(m)).toBeTruthy();
  expect(isEllipticalArc(m)).toBeFalsy();
  expect(isMoveTo(a)).toBeFalsy();
  expect(isEllipticalArc(a)).toBeTruthy();

  if (isEllipticalArc(a)) {
    const center = getCenterParams(a);
    expect(center.rx).toBeCloseTo(100, 6);
    expect(center.ry).toBeCloseTo(100, 6);
    expect(center.cx).toBeCloseTo(300, 6);
    expect(center.cy).toBeCloseTo(200, 6);
    expect(center.deltaTheta).toBeCloseTo(Math.PI / 2, 6);

    const pointA = getEllipsePoint(center, center.theta);
    const pointB = getEllipsePoint(center, center.theta + center.deltaTheta);

    expect(pointA.x).toBeCloseTo(getX(a.prev));
    expect(pointB.x).toBeCloseTo(a.x);
    expect(pointA.y).toBeCloseTo(getY(a.prev));
    expect(pointB.y).toBeCloseTo(a.y);
  }
});

test('Elliptical Arc Node. Radii scale up', () => {
  const d='M200 200A0.1 0.1-45 01 300 100';
  const path = fromString(d);
  const m = path[0];
  const a = path[1];

  expect(path.length).toBe(2);
  expect(isMoveTo(m)).toBeTruthy();
  expect(isEllipticalArc(m)).toBeFalsy();
  expect(isMoveTo(a)).toBeFalsy();
  expect(isEllipticalArc(a)).toBeTruthy();

  if (isEllipticalArc(a)) {
    const cx = (getX(a.prev) + a.x) / 2;
    const cy = (getY(a.prev) + a.y) / 2;
    const center = getCenterParams(a);
    expect(center.cx).toBeCloseTo(cx, 6);
    expect(center.cy).toBeCloseTo(cy, 6);
    expect(center.deltaTheta).toBeCloseTo(Math.PI, 6);

    // Test zero radii.
    a.rx = 0;
    a.ry = 0;

    const center0 = getCenterParams(a);
    expect(center0.cx).toBeCloseTo(cx, 6);
    expect(center0.cy).toBeCloseTo(cy, 6);
    expect(center0.deltaTheta).toBe(0);
  }
});
