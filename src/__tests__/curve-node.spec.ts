import { fromString } from '../builder';
import { isBezierCurve, isCurveTo, isQCurveTo, isSmoothCurveTo, isSmoothQCurveTo } from '../command-assertion';
import {
  getCurveBoundingRect,
  getFirstControlX,
  getFirstControlY,
  getLastControlX,
  getLastControlY,
  getQCurveBoundingRect,
} from '../curve-node';
import { getX, getY, makePath, PathNode } from '../path-node';

function testBezierCurves(path: ReadonlyArray<PathNode>) {
  for (const node of path) {
    if (isBezierCurve(node)) {
      expect(getFirstControlX(node)).not.toBeNaN();
      expect(getFirstControlY(node)).not.toBeNaN();
      expect(getLastControlX(node)).not.toBeNaN();
      expect(getLastControlY(node)).not.toBeNaN();
    }
  }
}

test('Cubic Bézier Nodes.', () => {
  const path = makePath([
    { name: 'M', x: 10, y: 90 },
    { name: 'C', x1: 30, y1: 90, x2: 25, y2: 10, x: 50, y: 10 },
    { name: 'S', x2: 70, y2: 90, x: 90, y: 90 },
  ]);

  const m = path[0];
  const c = path[1];
  const s = path[2];

  expect(isBezierCurve(m)).toBeFalsy();
  expect(isBezierCurve(c)).toBeTruthy();
  expect(isBezierCurve(s)).toBeTruthy();

  expect(isCurveTo(c)).toBeTruthy();
  expect(isSmoothCurveTo(c)).toBeFalsy();
  if (isCurveTo(c)) {
    expect(getFirstControlX(c)).toBe(c.x1);
    expect(getLastControlX(c)).toBe(c.x2);
    expect(getFirstControlY(c)).toBe(c.y1);
    expect(getLastControlY(c)).toBe(c.y2);
  }

  expect(isCurveTo(s)).toBeFalsy();
  expect(isSmoothCurveTo(s)).toBeTruthy();
  if (isSmoothCurveTo(s)) {
    expect(getFirstControlX(s)).toBe(75);
    expect(getLastControlX(s)).toBe(s.x2);
    expect(getFirstControlY(s)).toBe(10);
    expect(getLastControlY(s)).toBe(s.y2);
  }

  testBezierCurves(path);
});

test('Quadratic Bézier Nodes.', () => {
  const d = 'M10 50Q25 25 40 50t30 0t30 0h30t30 0t30 0t30 0';
  const path = fromString(d);

  const m = path[0];
  const q = path[1];
  const t = path[2];

  expect(isBezierCurve(m)).toBeFalsy();
  expect(isBezierCurve(q)).toBeTruthy();
  expect(isBezierCurve(t)).toBeTruthy();

  expect(isQCurveTo(q)).toBeTruthy();
  expect(isSmoothQCurveTo(q)).toBeFalsy();
  if (isQCurveTo(q)) {
    expect(getFirstControlX(q)).toBe(q.x1);
    expect(getLastControlX(q)).toBe(q.x1);
    expect(getFirstControlY(q)).toBe(q.y1);
    expect(getLastControlY(q)).toBe(q.y1);
  }

  expect(isQCurveTo(t)).toBeFalsy();
  expect(isSmoothQCurveTo(t)).toBeTruthy();
  if (isSmoothQCurveTo(t)) {
    expect(getFirstControlX(t)).toBe(55);
    expect(getLastControlX(t)).toBe(55);
    expect(getFirstControlY(t)).toBe(75);
    expect(getLastControlY(t)).toBe(75);
  }

  testBezierCurves(path);
});

test('Quadratic Bézier Node Bounding Box', () => {
  const path = fromString('m100 200q100-100 200 200-100-300-200-200');

  const m = path[0];
  const q1 = path[1];
  const q2 = path[2];

  expect(isQCurveTo(m)).toBeFalsy();
  expect(isQCurveTo(q1)).toBeTruthy();
  expect(isQCurveTo(q2)).toBeTruthy();

  if (isQCurveTo(q1) && isQCurveTo(q2)) {
    const r1 = getQCurveBoundingRect(q1);
    const r2 = getQCurveBoundingRect(q2);

    expect(r1.left).toBeCloseTo(getX(q1.prev), 6);
    expect(r1.right).toBeCloseTo(q1.x, 6);

    expect(r1.top).toBeGreaterThan(q1.y1);
    expect(r1.top).toBeLessThan(getY(q1.prev));
    expect(r1.top).toBeLessThan(q1.y);
    expect(r1.bottom).toBeCloseTo(q1.y, 6);

    expect(r2.left).toBeCloseTo(q2.x, 6);
    expect(r2.right).toBeCloseTo(getX(q2.prev), 6);

    expect(r2.top).toBeGreaterThan(q2.y1);
    expect(r2.top).toBeLessThan(q2.y);
    expect(r2.top).toBeLessThan(getY(q2.prev));
    expect(r2.bottom).toBeCloseTo(getY(q2.prev), 6);

    expect(r1.left).toBeCloseTo(r1.left, 6);
    expect(r1.top).toBeCloseTo(r2.top, 6);
    expect(r1.right).toBeCloseTo(r2.right, 6);
    expect(r1.bottom).toBeCloseTo(r2.bottom, 6);
  }
});

test('Cubic Bézier Node Bounding Box', () => {
  const path = fromString('m100 200c225-175-90 100 0 75-90 25 225-250 0-75');

  const m = path[0];
  const c1 = path[1];
  const c2 = path[2];

  expect(isCurveTo(m)).toBeFalsy();
  expect(isCurveTo(c1)).toBeTruthy();
  expect(isCurveTo(c2)).toBeTruthy();

  if (isCurveTo(c1) && isCurveTo(c2)) {
    const r1 = getCurveBoundingRect(c1);
    const r2 = getCurveBoundingRect(c2);

    expect(r1.left).toBeLessThan(getX(c1.prev));
    expect(r1.left).toBeLessThan(c1.x);
    expect(r1.left).toBeLessThan(c1.x1);
    expect(r1.left).toBeGreaterThan(c1.x2);
    expect(r1.right).toBeLessThan(c1.x1);
    expect(r1.right).toBeGreaterThan(c1.x2);
    expect(r1.right).toBeGreaterThan(c1.x);
    expect(r1.right).toBeGreaterThan(getX(c1.prev));

    expect(r1.left).toBeCloseTo(r1.left, 6);
    expect(r1.top).toBeCloseTo(r2.top, 6);
    expect(r1.right).toBeCloseTo(r2.right, 6);
    expect(r1.bottom).toBeCloseTo(r2.bottom, 6);
  }
});
