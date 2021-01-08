import { isClosePath, isMoveTo } from '../command-assertion';
import { getTokens } from '../parser';
import { createPathNode, getX, getY, PathNode } from '../path-node';

function createPath(pathData: string) {
  const tokens = getTokens(pathData);
  let node: PathNode | undefined;
  return tokens.map(token => node = createPathNode(token, node));
}

test('Path Node Creation.', () => {
  const data = 'M573 170c53 17 58 173 58 333s3 283 41 301h-121q31-365-56-579t36-122a25 25 0 11-25 25v45l38 27z';
  const path = createPath(data);
  
  expect(path.length).toBeGreaterThan(1);
  
  const head = path[0];
  const tail = path[path.length - 1];

  expect(head.name).toBe('M');
  expect(isMoveTo(head)).toBeTruthy();
  expect(isClosePath(head)).toBeFalsy();

  expect(tail.name).toBe('Z');
  expect(isMoveTo(tail)).toBeFalsy();
  expect(isClosePath(tail)).toBeTruthy();

  expect(getX(head)).toBe(getX(tail));
  expect(getY(head)).toBe(getY(tail));
  
  expect(getX(head.prev)).toBe(0);
  expect(getY(head.prev)).toBe(0);
});
