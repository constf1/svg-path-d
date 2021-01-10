import { asRelativeString, asString, fromString } from '../builder';

test('Path Node Creation.', () => {
  const dataA =
    'M158 950c69-37 82-68 82-132' +
    'v-596c0-60-16-100-60-132' +
    'h246c-44 36-53 67-53 131' +
    'v598c0 64 37 73 76 73s164 9 208-150' +
    'c43 78 11 208-46 208h-453z';
  const pathA = fromString(dataA);

  const dataB = pathA.map((item) => asString(item, 3)).join('');
  const pathB = fromString(dataB);

  const dataC = pathA.map((item) => asRelativeString(item)).join(' ');
  const pathC = fromString(dataC);

  expect(pathA.length).toBe(pathB.length);
  expect(pathB.length).toBe(pathC.length);

  for (let i = 0; i < pathA.length; i++) {
    expect(pathA[i].name).toBe(pathB[i].name);
    expect(pathB[i].name).toBe(pathC[i].name);
  }
});
