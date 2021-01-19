import { asRelativeString, asString, fromString } from '../builder';
import { applyHorizontalFlip, applyTranslate, applyVerticalFlip } from '../in-place-transform';

test('In place transformations.', () => {
  const data =
    'm-11-207c53 12 58 123 58 236s3 201 41 214h-121q31-259-56-411t36-87a25 18 38 11-25 18v32l38 19z' +
    'm118 359l29-21l38 19v32a25 18 38 10-25 18q123 65 36-87t-56-411h-121c38 13 41 100 41 214s5 224 58 236z';
  const path = fromString(data);

  const aStr1 = path.map((item) => asString(item, 3)).join('');
  const rStr1 = path.map((item) => asRelativeString(item, 3)).join('');

  const dx = -123.456789;
  const dy = 98.7654321;

  path.forEach((item) => applyTranslate(item, dx, dy));
  const aStr2 = path.map((item) => asString(item, 3)).join('');
  const rStr2 = path.map((item) => asRelativeString(item, 3)).join('');

  path.forEach((item) => applyTranslate(item, -dx, -dy));
  const aStr3 = path.map((item) => asString(item, 3)).join('');
  const rStr3 = path.map((item) => asRelativeString(item, 3)).join('');

  path.forEach((item) => applyHorizontalFlip(item));
  const aStr4 = path.map((item) => asString(item, 3)).join('');
  const rStr4 = path.map((item) => asRelativeString(item, 3)).join('');

  path.forEach((item) => applyHorizontalFlip(item));
  const aStr5 = path.map((item) => asString(item, 3)).join('');
  const rStr5 = path.map((item) => asRelativeString(item, 3)).join('');

  path.forEach((item) => applyVerticalFlip(item));
  const aStr6 = path.map((item) => asString(item, 3)).join('');
  const rStr6 = path.map((item) => asRelativeString(item, 3)).join('');

  path.forEach((item) => applyVerticalFlip(item));
  const aStr7 = path.map((item) => asString(item, 3)).join('');
  const rStr7 = path.map((item) => asRelativeString(item, 3)).join('');

  expect(aStr1).not.toBe(aStr2);
  expect(rStr1).not.toBe(rStr2);
  expect(aStr1).not.toBe(aStr4);
  expect(rStr1).not.toBe(rStr4);
  expect(aStr1).not.toBe(aStr6);
  expect(rStr1).not.toBe(rStr6);

  expect(aStr1).toBe(aStr3);
  expect(rStr1).toBe(rStr3);
  expect(aStr1).toBe(aStr5);
  expect(rStr1).toBe(rStr5);
  expect(aStr1).toBe(aStr7);
  expect(rStr1).toBe(rStr7);
});
