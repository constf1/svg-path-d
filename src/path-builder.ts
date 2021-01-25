import { getX, getY, PathNode } from './path-node';
import { applyTranslate } from './in-place-transform';

export class PathBuilder {
  get last(): PathNode | undefined {
    return this.path[this.path.length - 1];
  }

  get lastX(): number {
    return getX(this.last);
  }

  get lastY(): number {
    return getY(this.last);
  }

  constructor(readonly path: PathNode[] = []) {}

  push(next: PathNode): this {
    next.prev = this.last;
    this.path.push(next);
    return this;
  }

  /**
   * Adds `MoveTo` command to the path.
   * @param x absolute x coordinate to move to.
   * @param y absolute y coordinate to move to.
   */
  M(x: number, y: number): this {
    return this.push({ name: 'M', x, y });
  }

  /**
   * Adds `LineTo` command to the path.
   * @param x absolute x coordinate to draw line to.
   * @param y absolute y coordinate to draw line to.
   */
  L(x: number, y: number): this {
    return this.push({ name: 'L', x, y });
  }

  H(x: number): this {
    return this.push({ name: 'H', x });
  }

  V(y: number): this {
    return this.push({ name: 'V', y });
  }

  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    return this.push({ name: 'C', x1, y1, x2, y2, x, y });
  }

  S(x2: number, y2: number, x: number, y: number): this {
    return this.push({ name: 'S', x2, y2, x, y });
  }

  Q(x1: number, y1: number, x: number, y: number): this {
    return this.push({ name: 'Q', x1, y1, x, y });
  }

  T(x: number, y: number): this {
    return this.push({ name: 'T', x, y });
  }

  A(rx: number, ry: number, angle: number, largeArc: number, sweep: number, x: number, y: number): this {
    const largeArcFlag = !!largeArc;
    const sweepFlag = !!sweep;
    return this.push({ name: 'A', rx, ry, angle, largeArcFlag, sweepFlag, x, y });
  }

  Z(): this {
    return this.push({ name: 'Z' });
  }

  /**
   * Adds `MoveTo` command to the path.
   * @param dx relative x coordinate to move to.
   * @param dy relative y coordinate to move to.
   */
  m(dx: number, dy: number): this {
    return this.M(dx, dy)._relative();
  }

  /**
   * Adds `LineTo` command to the path.
   * @param dx relative x coordinate to draw line to.
   * @param dy relative y coordinate to draw line to.
   */
  l(dx: number, dy: number): this {
    return this.L(dx, dy)._relative();
  }

  h(dx: number): this {
    return this.H(dx)._relative();
  }

  v(dy: number): this {
    return this.V(dy)._relative();
  }

  c(dx1: number, dy1: number, dx2: number, dy2: number, dx: number, dy: number): this {
    return this.C(dx1, dy1, dx2, dy2, dx, dy)._relative();
  }

  s(dx2: number, dy2: number, dx: number, dy: number): this {
    return this.S(dx2, dy2, dx, dy)._relative();
  }

  q(dx1: number, dy1: number, dx: number, dy: number): this {
    return this.Q(dx1, dy1, dx, dy)._relative();
  }

  t(dx: number, dy: number): this {
    return this.T(dx, dy)._relative();
  }

  a(rx: number, ry: number, angle: number, largeArc: number, sweep: number, dx: number, dy: number): this {
    return this.A(rx, ry, angle, largeArc, sweep, dx, dy)._relative();
  }

  z(): this {
    return this.Z();
  }

  private _relative(): this {
    const last = this.last;
    if (last) {
      const prev = last.prev;
      applyTranslate(last, getX(prev), getY(prev));
    }
    return this;
  }
}
