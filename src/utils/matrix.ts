/**
 * A 2D 3x2 matrix with six parameters a, b, c, d, e and f.
 * It is equivalent to applying the 3x3 transformation matrix:
 * <pre>
 * | x1 |   | a c e |   | x |
 * | y1 | = | b d f | * | y |
 * |  1 |   | 0 0 1 |   | 1 |
 * </pre>
 * http://www.w3.org/TR/css3-transforms/#recomposing-to-a-2d-matrix
 */
export interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export type ReadonlyMatrix = Readonly<Matrix>;

export function isIdentity(m: ReadonlyMatrix): boolean {
  return m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0;
}

export function isTranslate(m: ReadonlyMatrix): boolean {
  return m.a === 1 && m.d === 1 && m.b === 0 && m.c === 0;
}

export function isScale(m: ReadonlyMatrix): boolean {
  return m.e === 0 && m.f === 0 && m.b === 0 && m.c === 0;
}

export function createIdentity(): Matrix {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

export function createTranslate(x: number, y: number): Matrix {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
}

/**
 * Creates a scale matrix.
 * @param scaleX The amount by which to scale along the x-axis.
 * @param scaleY The amount by which to scale along the y-axis.
 */
export function createScale(scaleX: number, scaleY: number): Matrix {
  return { a: scaleX, b: 0, c: 0, d: scaleY, e: 0, f: 0 };
}

/**
 * Creates a scale about the specified point matrix.
 * @param scaleX The amount by which to scale along the x-axis.
 * @param scaleY The amount by which to scale along the y-axis.
 * @param centerX The x-coordinate of the scale operation's center point.
 * @param centerY The y-coordinate of the scale operation's center point.
 */
export function createScaleAt(scaleX: number, scaleY: number, centerX: number, centerY: number): Matrix {
  // Analog of:
  // SVG.transform="translate(cx, cy) scale(sx, sy) translate(-cx, -cy)"
  // or
  // multiply(
  //   createTranslate(centerX, centerY),
  //   multiply(createScale(scaleX, scaleY), createTranslate(-centerX, -centerY))
  // );
  return { a: scaleX, b: 0, c: 0, d: scaleY, e: centerX * (1 - scaleX), f: centerY * (1 - scaleY) };
}

export function createSkew(skewX: number, skewY: number): Matrix {
  return { a: 1, b: Math.tan(skewY), c: Math.tan(skewX), d: 1, e: 0, f: 0 };
}

/**
 * Creates a rotation matrix.
 * @param angle The rotation angle, in radians.
 */
export function createRotate(angle: number): Matrix {
  return { a: Math.cos(angle), b: Math.sin(angle), c: -Math.sin(angle), d: Math.cos(angle), e: 0, f: 0 };
}

/**
 * Creates a rotation matrix about the specified point.
 * @param angle The angle, in radians, by which to rotate.
 * @param centerX The x-coordinate of the point about which to rotate.
 * @param centerY The y-coordinate of the point about which to rotate.
 */
export function createRotateAt(angle: number, centerX: number, centerY: number): Matrix {
  // Analog of:
  // SVG.transform="translate(cx, cy) rotate(deg) translate(-cx, -cy)"
  // or
  // multiply(
  //   createTranslate(centerX, centerY),
  //   multiply(createRotate(angle), createTranslate(-centerX, -centerY))
  // );
  const a = Math.cos(angle);
  const b = Math.sin(angle);
  return { a, b, c: -b, d: a, e: (1 - a) * centerX + b * centerY, f: (1 - a) * centerY - b * centerX };
}

export function multiply(A: ReadonlyMatrix, B: ReadonlyMatrix): Matrix {
  return {
    a: A.a * B.a + A.c * B.b,
    b: A.b * B.a + A.d * B.b,
    c: A.a * B.c + A.c * B.d,
    d: A.b * B.c + A.d * B.d,
    e: A.a * B.e + A.c * B.f + A.e,
    f: A.b * B.e + A.d * B.f + A.f,
  };
}

/**
 * Returns an inverted version of the matrix.
 * @param m the given matrix
 */
export function invert(m: ReadonlyMatrix): Matrix {
  const x = m.a * m.d - m.b * m.c;
  return {
    a: m.d / x,
    b: -m.b / x,
    c: -m.c / x,
    d: m.a / x,
    e: (m.c * m.f - m.d * m.e) / x,
    f: (m.b * m.e - m.a * m.f) / x,
  };
}

export function toArray(m: ReadonlyMatrix): number[] {
  return [m.a, m.b, m.c, m.d, m.e, m.f];
}

export function toString(m: ReadonlyMatrix): string {
  return 'matrix(' + toArray(m).join(', ') + ')';
}

// from http://math.stackexchange.com/questions/861674/decompose-a-2d-arbitrary-transform-into-only-scaling-and-rotation
export function decompose(
  m: ReadonlyMatrix
): {
  translateX: number;
  translateY: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  skew: number;
} {
  const E = (m.a + m.d) / 2;
  const F = (m.a - m.d) / 2;
  const G = (m.c + m.b) / 2;
  const H = (m.c - m.b) / 2;

  const Q = Math.sqrt(E * E + H * H);
  const R = Math.sqrt(F * F + G * G);
  const a1 = Math.atan2(G, F);
  const a2 = Math.atan2(H, E);
  const theta = (a2 - a1) / 2;
  const phi = (a2 + a1) / 2;

  return {
    translateX: m.e,
    translateY: m.f,
    rotate: (-phi * 180) / Math.PI,
    scaleX: Q + R,
    scaleY: Q - R,
    skew: (-theta * 180) / Math.PI,
  };
}
