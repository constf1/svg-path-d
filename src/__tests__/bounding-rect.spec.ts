import { fromString } from '../builder';
import { getBoundingRect, getItemBoundingRect } from '../bounding-rect';
import { isPointIn } from '../utils/math2d';

test('Path Bounding Box', () => {
  const path = fromString('m10 20h122l25 25c114 0 0 14 25 38s25-13 25 12v25q-25 0-25 25t-18 10a250 150-30 01-154-135z');
  const rc = getBoundingRect(path);

  expect(rc.left).toBeLessThan(rc.right);
  expect(rc.top).toBeLessThan(rc.bottom);

  for (const item of path) {
    const rcItem = getItemBoundingRect(item);
    expect(isPointIn(rc, rcItem.left, rcItem.top)).toBeTruthy();
    expect(isPointIn(rc, rcItem.right, rcItem.bottom)).toBeTruthy();
  }
});
