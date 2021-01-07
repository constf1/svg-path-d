import { isMoveTo, MoveTo } from '..'

function createMoveTo(x: number, y: number): MoveTo {
  return { name: "M", x, y };
}

test('Is MoveTo', () => {
  const M = createMoveTo(0, 0);

  expect(isMoveTo(M)).toBe(true);
})
