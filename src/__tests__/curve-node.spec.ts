import { fromString } from '../builder';
import { isBezierCurve, isCurveTo, isQCurveTo, isSmoothCurveTo, isSmoothQCurveTo } from '../command-assertion';
import { getFirstControlX, getFirstControlY, getLastControlX, getLastControlY } from '../curve-node';
import { makePath, PathNode } from '../path-node';

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
    { name: 'S', x2: 70, y2: 90, x: 90, y: 90 }
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
  const d='M10 50Q25 25 40 50t30 0t30 0h30t30 0t30 0t30 0';
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
