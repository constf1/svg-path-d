import * as M from '../../utils/matrix';

function matrixEqualityTest(m1: M.ReadonlyMatrix, m2: M.ReadonlyMatrix, numDigits = 6) {
  expect(m1.a).toBeCloseTo(m2.a, numDigits);
  expect(m1.b).toBeCloseTo(m2.b, numDigits);
  expect(m1.c).toBeCloseTo(m2.c, numDigits);
  expect(m1.d).toBeCloseTo(m2.d, numDigits);
  expect(m1.f).toBeCloseTo(m2.f, numDigits);
}

type Decomposition = ReturnType<typeof M.decompose>;

function decompositionEqualityTest(d1: Decomposition, d2: Decomposition, numDigits = 6) {
  expect(d1.rotate).toBeCloseTo(d2.rotate, numDigits);
  expect(d1.scaleX).toBeCloseTo(d2.scaleX, numDigits);
  expect(d1.scaleY).toBeCloseTo(d2.scaleY, numDigits);
  expect(d1.skew).toBeCloseTo(d2.skew, numDigits);
  expect(d1.translateX).toBeCloseTo(d2.translateX, numDigits);
  expect(d1.translateY).toBeCloseTo(d2.translateY, numDigits);
}

test('Matrix functions', () => {
  const SX = 1.23456789;
  const SY = 9.87654321;

  const DX = 123.456789;
  const DY = -98.7654321;

  const DA = Math.PI * 0.123456789;

  const mi = M.createIdentity();
  const mr1 = M.createRotate(DA);
  const ms1 = M.createScale(SX, SY);
  const mt1 = M.createTranslate(-DX, -DY);
  const mt2 = M.createTranslate(DX, DY);

  expect(M.isScale(mi)).toBeTruthy();
  expect(M.isTranslate(mi)).toBeTruthy();
  expect(M.isIdentity(mi)).toBeTruthy();

  expect(M.isScale(ms1)).toBeTruthy();
  expect(M.isTranslate(ms1)).toBeFalsy();
  expect(M.isIdentity(ms1)).toBeFalsy();

  expect(M.isTranslate(mt1)).toBeTruthy();
  expect(M.isScale(mt1)).toBeFalsy();
  expect(M.isIdentity(mt1)).toBeFalsy();

  expect(M.isTranslate(mt2)).toBeTruthy();
  expect(M.isScale(mt2)).toBeFalsy();
  expect(M.isIdentity(mt2)).toBeFalsy();

  const mra1 = M.createRotateAt(DA, DX, DY);
  const mra2 = M.multiply(mt2, M.multiply(mr1, mt1));
  matrixEqualityTest(mra1, mra2, 6);

  const msa1 = M.createScaleAt(SX, SY, DX, DY);
  const msa2 = M.multiply(mt2, M.multiply(ms1, mt1));
  matrixEqualityTest(msa1, msa2, 6);

  const mi1 = M.multiply(mra1, M.invert(mra1));
  matrixEqualityTest(mi, mi1, 6);

  const mi2 = M.multiply(msa1, M.invert(msa1));
  matrixEqualityTest(mi, mi2, 6);

  decompositionEqualityTest(
    M.decompose(mi),
    {
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      skew: 0,
      translateX: 0,
      translateY: 0,
    },
    6
  );

  decompositionEqualityTest(
    M.decompose(mt1),
    {
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      skew: 0,
      translateX: -DX,
      translateY: -DY,
    },
    6
  );

  decompositionEqualityTest(
    M.decompose(mt2),
    {
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      skew: 0,
      translateX: DX,
      translateY: DY,
    },
    6
  );
});
