import { twoVectorsAngle } from '../../utils/math2d';

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

test('twoVectorsAngle function', () => {
  for (const angle90 of [
    twoVectorsAngle(1, 0, 0, 1),
    twoVectorsAngle(0, 10, -1, 0),
    twoVectorsAngle(-1, -1, 10, -10),
    twoVectorsAngle(1 / 3, 1 / 3, -1, 1),
  ]) {
    expect(toDeg(angle90)).toBeCloseTo(90, 6);
  }

  for (const angle135 of [
    twoVectorsAngle(-1, 1, 0, -1),
    twoVectorsAngle(-10, 10, 0, -1),
    twoVectorsAngle(-1, 1, 0, -100),
    twoVectorsAngle(-1000, 1000, 0, -0.0001),
  ]) {
    expect(toDeg(angle135)).toBeCloseTo(135, 6);
  }

  for (const angleMinus90 of [
    twoVectorsAngle(0, 1, 1, 0),
    twoVectorsAngle(-1, 0, 0, 10),
    twoVectorsAngle(10, -10, -1, -1),
    twoVectorsAngle(-1, 1, 1 / 3, 1 / 3),
  ]) {
    expect(toDeg(angleMinus90)).toBeCloseTo(-90, 6);
  }
});
