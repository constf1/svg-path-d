import * as Path from '..';

test('Path Creation.', () => {
  const data = 'M100 100s-25 0-25 25c0 25 0 50 25 50s0 25 25 25h25q25 0 25-25t25-25l25-5t25-10a50 25-10 00-75-35z';
  const pathA = Path.fromString(data);

  const dataB = pathA.map((item) => Path.asString(item, 3)).join('');
  const pathB = Path.fromString(dataB);

  const dataC = pathA.map((item) => Path.asRelativeString(item)).join(' ');
  const pathC = Path.fromString(dataC);

  expect(pathA.length).toBe(pathB.length);
  expect(pathB.length).toBe(pathC.length);

  for (let i = 0; i < pathA.length; i++) {
    expect(pathA[i].name).toBe(pathB[i].name);
    expect(pathB[i].name).toBe(pathC[i].name);
  }

  for (const token of Path.getTokens(dataB)) {
    expect(token.relative).toBeFalsy();
  }

  for (const token of Path.getTokens(dataC)) {
    expect(token.relative).toBeTruthy();
  }
});
