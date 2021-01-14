import { addRect } from '../utils/math2d';
import { getCenterParams, getEllipsePoint, getEllipticalArcBoundingRect } from '../arc-node';
import { fromString } from '../builder';
import { isEllipticalArc, isMoveTo } from '../command-assertion';
import { getX, getY } from '../path-node';

test('Elliptical Arc Nodes', () => {
  const d = 'M200 200A100 100-45 01 300 100';
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
  const d = 'M200 200A0.1 0.1-45 01 300 100';
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

test('Elliptical Arc Node Bounding Box', () => {
  const path = fromString('m200 100a150 80 30 01 126.087 59.663 150 80 30 01-136.087 100.337 150 80 30 10 10-160z');

  const m = path[0];
  const a1 = path[1];
  const a2 = path[2];
  const a3 = path[3];

  expect(isEllipticalArc(m)).toBeFalsy();
  expect(isEllipticalArc(a1)).toBeTruthy();
  expect(isEllipticalArc(a2)).toBeTruthy();
  expect(isEllipticalArc(a3)).toBeTruthy();

  if (isEllipticalArc(a1) && isEllipticalArc(a2) && isEllipticalArc(a3)) {
    const r1 = getEllipticalArcBoundingRect(a1);
    const r2 = getEllipticalArcBoundingRect(a2);
    const r3 = getEllipticalArcBoundingRect(a3);

    expect(r1.left).toBeCloseTo(getX(a1.prev));
    expect(r1.top).toBeCloseTo(getY(a1.prev));
    expect(r1.right).toBeCloseTo(a1.x);
    expect(r1.bottom).toBeCloseTo(a1.y);

    expect(r2.left).toBeCloseTo(a2.x);
    expect(r2.top).toBeCloseTo(getY(a2.prev));
    expect(r2.right).toBeGreaterThan(getX(a2.prev));
    expect(r2.bottom).toBeGreaterThan(a2.y);

    addRect(r1, r2);

    expect(r3.left).toBeCloseTo(r1.left);
    expect(r3.top).toBeCloseTo(r1.top);
    expect(r3.right).toBeCloseTo(r1.right);
    expect(r3.bottom).toBeCloseTo(r1.bottom);
  }
});
