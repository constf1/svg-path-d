import { getX, getY, PathNode } from './path-node';
import { applyTranslate } from './in-place-transform';

export class PathBuilder {
  get last(): PathNode | undefined {
    return this.path[this.path.length - 1];
  }

  constructor(readonly path: PathNode[] = []) {}

  M(x: number, y: number): this {
    this.path.push({ name: 'M', x, y, prev: this.last });
    return this;
  }

  L(x: number, y: number): this {
    this.path.push({ name: 'L', x, y, prev: this.last });
    return this;
  }

  H(x: number): this {
    this.path.push({ name: 'H', x, prev: this.last });
    return this;
  }

  V(y: number): this {
    this.path.push({ name: 'V', y, prev: this.last });
    return this;
  }

  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    this.path.push({ name: 'C', x1, y1, x2, y2, x, y, prev: this.last });
    return this;
  }

  S(x2: number, y2: number, x: number, y: number): this {
    this.path.push({ name: 'S', x2, y2, x, y, prev: this.last });
    return this;
  }

  Q(x1: number, y1: number, x: number, y: number): this {
    this.path.push({ name: 'Q', x1, y1, x, y, prev: this.last });
    return this;
  }

  T(x: number, y: number): this {
    this.path.push({ name: 'T', x, y, prev: this.last });
    return this;
  }

  A(rx: number, ry: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this {
    this.path.push({
      name: 'A',
      rx,
      ry,
      angle,
      largeArcFlag: !!largeArcFlag,
      sweepFlag: !!sweepFlag,
      x,
      y,
      prev: this.last,
    });
    return this;
  }

  Z(): this {
    this.path.push({ name: 'Z', prev: this.last });
    return this;
  }

  m(x: number, y: number): this {
    return this.M(x, y)._relative();
  }

  l(x: number, y: number): this {
    return this.L(x, y)._relative();
  }

  h(x: number): this {
    return this.H(x)._relative();
  }

  v(y: number): this {
    return this.V(y)._relative();
  }

  c(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    return this.C(x1, y1, x2, y2, x, y)._relative();
  }

  s(x2: number, y2: number, x: number, y: number): this {
    return this.S(x2, y2, x, y)._relative();
  }

  q(x1: number, y1: number, x: number, y: number): this {
    return this.Q(x1, y1, x, y)._relative();
  }

  t(x: number, y: number): this {
    return this.T(x, y)._relative();
  }

  a(rx: number, ry: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this {
    return this.A(rx, ry, angle, largeArcFlag, sweepFlag, x, y)._relative();
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
