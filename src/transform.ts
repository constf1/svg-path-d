import { ReadonlyMatrix } from './utils/matrix';
import { EllipseShape } from './command';
import {
  isClosePath,
  isCurveTo,
  isEllipticalArc,
  isHLineTo,
  isQCurveTo,
  isSmoothCurveTo,
  isVLineTo,
} from './command-assertion';
import { getX, getY, PathNode, clonePath } from './path-node';
import { Point } from './utils/math2d';

export function transformedX(m: ReadonlyMatrix, x: number, y: number): number {
  return m.a * x + m.c * y + m.e;
}

export function transformedY(m: ReadonlyMatrix, x: number, y: number): number {
  return m.b * x + m.d * y + m.f;
}

export function transformedPoint(m: ReadonlyMatrix, point: Readonly<Point>): Point {
  return { x: transformedX(m, point.x, point.y), y: transformedY(m, point.x, point.y) };
}

export function transformedEllipse(m: ReadonlyMatrix, ellipse: Readonly<EllipseShape>): EllipseShape {
  // Step 1. Rotate ellipse.
  // The standard equation for an ellipse:
  // x^2 / rx^2 + y^2 / ry^2 = 1
  // It represents an ellipse centered at the origin and with axes lying along the coordinate axes.

  // Applying rotation matrix to it
  // | x | = | cos(phi) sin(phi) | * | x0 |
  // | y | = |-sin(phi) cos(phi) |   | y0 |
  // leads to the following equation for a standard ellipse which has been rotated through an angle phi:
  // (x * cos(phi) + y * sin(phi))^2 / rx^2 + (-x * sin(phi) + y * cos(phi))^2 / ry^2 = 1
  // Which gives:
  //   (cos(phi)^2 / rx^2 + sin(phi)^2 / ry^2) * x^2
  // + 2 * cos(phi) * sin(phi) * (1 / rx^2 - 1 / ry^2) * x * y
  // + (sin(phi)^2 / rx^2 + cos(phi)^2 / ry^2) * y^2
  // = 1
  // Which is the general conic form: A * x^2 + B * x * y + C * y^2 = 1
  const phi = (ellipse.angle * Math.PI) / 180;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const curveX = 1 / (ellipse.rx * ellipse.rx);
  const curveY = 1 / (ellipse.ry * ellipse.ry);
  // A = cos(phi)^2 / rx^2 + sin(phi)^2 / ry^2
  const A = cosPhi * cosPhi * curveX + sinPhi * sinPhi * curveY;
  // B = 2 * cos(phi) * sin(phi) * (1 / rx^2 - 1 / ry^2)
  const B = 2 * cosPhi * sinPhi * (curveX - curveY);
  // C = sin(phi)^2 / rx^2 + cos(phi)^2 / ry^2
  const C = sinPhi * sinPhi * curveX + cosPhi * cosPhi * curveY;

  // Step 2. Apply ellipse shape transformation matrix.
  // | x1 | = | a c | * | x |
  // | y1 | = | b d |   | y |
  // We ignore e and f, since translations don't affect the shape of the ellipse.
  // A′*x^2 + B′*x*y + C′*y^2 = D′

  const A_ = A * m.d * m.d - B * m.b * m.d + C * m.b * m.b;
  const B_ = B * (m.a * m.d + m.b * m.c) - 2 * (A * m.c * m.d + C * m.a * m.b);
  const C_ = A * m.c * m.c - B * m.a * m.c + C * m.a * m.a;
  const D_ = m.a * m.d - m.b * m.c;

  // Step 3. Get back to axis-aligned ellipse equation.
  // | x1 | = | cos(phi′) -sin(phi′) | * | x2 |
  // | y1 | = | sin(phi′)  cos(phi′) |   | y2 |
  const phi_ = ((Math.atan2(B_, A_ - C_) + Math.PI) % Math.PI) / 2;
  // Note: For any integer n, (atan2(B1, A1 - C1) + n*pi)/2 is a solution to the above.
  // Incrementing n (rotating an ellipse by pi/2) just swaps the x and y radii computed below.
  // Choosing the rotation between 0 and pi/2 eliminates the ambiguity and leads to more predictable output.

  // Finally, we get rx′ and ry′ from the same-zeroes relationship that gave us phi′
  const sinPhi_ = Math.sin(phi_);
  const cosPhi_ = Math.cos(phi_);

  const rx_ = Math.abs(D_) / Math.sqrt(A_ * cosPhi_ * cosPhi_ + B_ * sinPhi_ * cosPhi_ + C_ * sinPhi_ * sinPhi_);
  const ry_ = Math.abs(D_) / Math.sqrt(A_ * sinPhi_ * sinPhi_ - B_ * sinPhi_ * cosPhi_ + C_ * cosPhi_ * cosPhi_);

  const angle_ = (phi_ * 180) / Math.PI;
  // sweepFlag needs to be inverted for a reflection transformation
  const sweepFlag_ = 0 > D_ ? !ellipse.sweepFlag : ellipse.sweepFlag;

  return { rx: rx_ || 0, ry: ry_ || 0, angle: angle_ || 0, largeArcFlag: ellipse.largeArcFlag, sweepFlag: sweepFlag_ };
}

export function transformedNode(matrix: ReadonlyMatrix, node: Readonly<PathNode>): PathNode {
  if (isClosePath(node)) {
    return { name: node.name };
  } else if (isHLineTo(node)) {
    const y0 = getY(node.prev);
    const x = transformedX(matrix, node.x, y0);
    const y = transformedY(matrix, node.x, y0);
    return { name: 'L', x, y };
  } else if (isVLineTo(node)) {
    const x0 = getX(node.prev);
    const x = transformedX(matrix, x0, node.y);
    const y = transformedY(matrix, x0, node.y);
    return { name: 'L', x, y };
  } else {
    const x = transformedX(matrix, node.x, node.y);
    const y = transformedY(matrix, node.x, node.y);
    if (isQCurveTo(node)) {
      const x1 = transformedX(matrix, node.x1, node.y1);
      const y1 = transformedY(matrix, node.x1, node.y1);
      return { name: node.name, x1, y1, x, y };
    } else if (isSmoothCurveTo(node)) {
      const x2 = transformedX(matrix, node.x2, node.y2);
      const y2 = transformedY(matrix, node.x2, node.y2);
      return { name: node.name, x2, y2, x, y };
    } else if (isCurveTo(node)) {
      const x1 = transformedX(matrix, node.x1, node.y1);
      const y1 = transformedY(matrix, node.x1, node.y1);
      const x2 = transformedX(matrix, node.x2, node.y2);
      const y2 = transformedY(matrix, node.x2, node.y2);
      return { name: node.name, x1, y1, x2, y2, x, y };
    } else if (isEllipticalArc(node)) {
      return { name: node.name, ...transformedEllipse(matrix, node), x, y };
    } else {
      // if (isMoveTo(node) || isLineTo(node) || isSmoothQCurveTo(node))
      return { name: node.name, x, y };
    }
  }
}

export function createTransformed(path: PathNode[], matrix: ReadonlyMatrix): PathNode[] {
  return clonePath(path, (item) => transformedNode(matrix, item));
}

// export function createTranslated(path: PathNode[], deltaX: number, deltaY: number): PathNode[] {
//   return clonePath(path, (item) => {
//     const next = { ...item };
//     applyTranslate(next, deltaX, deltaY);
//     return next;
//   });
// }
