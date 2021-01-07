import { DrawCommand } from '..';
import { DrawToken, getTokens } from '../parser';

const NUMBER_OF_ARGUMENTS: {[key in DrawCommand]: number} = {
  A: 7,
  C: 6,
  H: 1,
  L: 2,
  M: 2,
  Q: 4,
  S: 4,
  T: 2,
  V: 1,
  Z: 0,
};

function testNumberOfArguments(tokens: ReadonlyArray<DrawToken>) {
  for (const t of tokens) {
    const n = NUMBER_OF_ARGUMENTS[t.name];
    expect(n).toBeDefined();
    if (n) {
      expect(n).toBe(t.args.length);
    }
  }
}

test('Path Data Parser', () => {
  const pathData = ['M15 325', 'a497 314 0 01 994 0', 'a497 314 0 01-994 0',
    'm26 0', 'a471 287 0 00 942 0', 'a471 287 0 00-942 0', 'z',
    'm471 232', 'c-21-80-103-166-141-51', 'c-48-112-212-112-129 29', 'a447 263 0 01 109-455', 'c-123 180 59 277 89 137',
    'l14-136', 'l30 36', 'h56', 'l30-36', 'l14 136', 'c26 137 215 46 88-137', 'a447 263 0 01 109 455', 'c84-117-60-160-128-30',
    'c-37-113-121-27-141 52', 'z'];
  const tokens = getTokens(pathData.join(''));

  expect(tokens.length).toEqual(pathData.length);
  expect(tokens[0].name).toEqual('M');
  
  expect(tokens[1].name).toEqual('A');
  expect(tokens[1].relative).toBeTruthy();

  expect(tokens[tokens.length - 1].name).toEqual('Z');

  testNumberOfArguments(tokens);
});
