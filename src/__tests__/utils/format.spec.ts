import { formatDecimal } from '../../utils/format';

test('formatDecimal function', () => {
  const n1 = 0.123456789;
  const n2 = 9.87654321;

  expect(formatDecimal(n1)).toBe('0');
  expect(formatDecimal(n2)).toBe('10');

  expect(formatDecimal(n1, 1)).toBe('0.1');
  expect(formatDecimal(n2, 1)).toBe('9.9');

  expect(formatDecimal(n1, 2)).toBe('0.12');
  expect(formatDecimal(n2, 2)).toBe('9.88');

  expect(formatDecimal(n1, 4)).toBe('0.1235');
  expect(formatDecimal(n2, 4)).toBe('9.8765');

  expect(formatDecimal(n1, 8)).toBe('0.12345679');
  expect(formatDecimal(n2, 8)).toBe('9.87654321');
});
