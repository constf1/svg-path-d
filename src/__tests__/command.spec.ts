import { HLineTo, LineTo, MoveTo, VLineTo } from '../command'
import { isHLineTo, isLineTo, isMoveTo, isVLineTo } from '../command-assertion'

function createMoveTo(x: number, y: number): MoveTo {
  return { name: 'M', x, y };
}

function createLineTo(x: number, y: number): LineTo {
  return { name: 'L', x, y };
}

function createHLineTo(x: number): HLineTo {
  return { name: 'H', x };
}

function createVLineTo(y: number): VLineTo {
  return { name: 'V', y };
}

test('Command Type Assertions', () => {
  const M = createMoveTo(0, 0);
  const L = createLineTo(10, 10);
  const H = createHLineTo(20);
  const V = createVLineTo(20);

  expect(isMoveTo(M)).toBe(true);
  expect(isLineTo(M)).toBe(false);
  expect(isHLineTo(M)).toBe(false);
  expect(isVLineTo(M)).toBe(false);

  expect(isMoveTo(L)).toBe(false);
  expect(isLineTo(L)).toBe(true);
  expect(isHLineTo(L)).toBe(false);
  expect(isVLineTo(L)).toBe(false);

  expect(isMoveTo(H)).toBe(false);
  expect(isLineTo(H)).toBe(false);
  expect(isHLineTo(H)).toBe(true);
  expect(isVLineTo(H)).toBe(false);

  expect(isMoveTo(V)).toBe(false);
  expect(isLineTo(V)).toBe(false);
  expect(isHLineTo(V)).toBe(false);
  expect(isVLineTo(V)).toBe(true);
});
