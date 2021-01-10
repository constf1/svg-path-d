import { lerp } from './utils/math1d';
import { approximateEllipticalArc } from './arc-node';
import { ClosePath, DrawCommand, EllipticalArc } from './command';
import { isClosePath, isEllipticalArc, isMoveTo } from './command-assertion';
import { getX, getY, makePath, PathNode } from './path-node';
import { canPromoteToCurve, promoteToCurve } from './promoter';
import { getGroups, split } from './splitter';
import { getParams } from './builder';

export type AlignmentOptions = {
  groupClosePoints?: { x: number; y: number }[];
};

export type InterpolatorOptions = AlignmentOptions & {
  formatter?: (n: number) => string;
};

function stretch(pathGroup: PathNode[], size: number): PathNode[] {
  const first = pathGroup[0];
  if (!(first && isMoveTo(first))) {
    throw new Error('First node in a path group should be MoveTo!');
  }

  const items: PathNode[] = [{ ...first }];

  const a = pathGroup.length - 1;
  const b = size - 1;

  if (a > 0) {
    // Splitting existing nodes.
    const r = b % a;
    const n = (b - r) / a;
    for (let i = 1; i <= a; i++) {
      const node = pathGroup[i];
      const x = i <= r ? n + 1 : n;
      if (x > 1) {
        items.push(...split(node, x));
      } else {
        items.push({ ...node });
      }
    }
  } else {
    // Adding empty nodes.
    for (let i = 0; i < b; i++) {
      items.push({ name: 'L', x: first.x, y: first.y });
    }
  }
  return makePath(items);
}

function alignGroups(groupA: NormalizedNode[], groupB: NormalizedNode[]): NormalizedNode[][] {
  const count = Math.max(groupA.length, groupB.length);

  if (groupA.length < count) {
    groupA = stretch(groupA, count);
  } else if (groupB.length < count) {
    groupB = stretch(groupB, count);
  }

  const itemsA: NormalizedNode[] = [];
  const itemsB: NormalizedNode[] = [];

  for (let i = 0; i < count; i++) {
    const a = groupA[i];
    const b = groupB[i];
    if (a.name === b.name) {
      itemsA.push({ ...a });
      itemsB.push({ ...b });
    } else {
      itemsA.push(canPromoteToCurve(a) ? promoteToCurve(a) : { ...a });
      itemsB.push(canPromoteToCurve(b) ? promoteToCurve(b) : { ...b });
    }
  }

  return [makePath(itemsA), makePath(itemsB)];
}

type NormalizedNode = Exclude<PathNode, EllipticalArc & ClosePath>;

function normalize(path: PathNode[]): NormalizedNode[] {
  const items: NormalizedNode[] = [];

  // Let's start with a MoveTo node.
  if (path.length <= 0 || !isMoveTo(path[0])) {
    items.push({ name: 'M', x: 0, y: 0 });
  }

  // Get rid of EllipticalArcs and ClosePaths.
  for (const node of path) {
    if (isEllipticalArc(node)) {
      items.push(...approximateEllipticalArc(node));
    } else if (isClosePath(node)) {
      const prev = node.prev;
      const x0 = getX(prev);
      const y0 = getY(prev);
      const x = getX(node);
      const y = getY(node);
      if (x0 !== x || y0 !== y) {
        items.push({ name: 'L', x, y, prev });
      }
    } else {
      items.push({ ...node });
    }
  }
  return makePath(items);
}

function addEmptyGroups(groups: PathNode[][], count: number, stopPoints?: { x: number; y: number }[]): void {
  for (let i = 0; i < count; i++) {
    const lastGroup = groups[groups.length - 1];
    const prev = lastGroup[lastGroup.length - 1];

    let x;
    let y;
    if (stopPoints && stopPoints.length > i) {
      x = stopPoints[i].x;
      y = stopPoints[i].y;
    } else {
      x = getX(prev);
      y = getY(prev);
    }
    groups.push([{ name: 'M', x, y, prev }]);
  }
}

export function align(src: PathNode[], dst: PathNode[], options?: AlignmentOptions): PathNode[][] {
  const srcGroups = getGroups(normalize(src));
  const dstGroups = getGroups(normalize(dst));

  const count = srcGroups.length - dstGroups.length;
  if (count < 0) {
    addEmptyGroups(srcGroups, -count, options?.groupClosePoints);
  } else if (count > 0) {
    addEmptyGroups(dstGroups, count, options?.groupClosePoints);
  }

  const size = srcGroups.length;
  const itemsA: PathNode[] = [];
  const itemsB: PathNode[] = [];
  for (let i = 0; i < size; i++) {
    const [a, b] = alignGroups(srcGroups[i], dstGroups[i]);
    itemsA.push(...a);
    itemsB.push(...b);
  }

  return [makePath(itemsA), makePath(itemsB)];
}

const ARGS_COUNT: { [key in DrawCommand]: number } = {
  Z: 0, // Close Path: Z
  H: 1, // Horizontal Line To: H x
  V: 1, // Vertical Line To: V y
  L: 2, // Line To: L x y
  M: 2, // Move To: M x y
  T: 2, // Shortcut Quadratic Curve To: T x y
  Q: 4, // Quadratic Curve To: Q x1 y1, x y
  S: 4, // Shortcut Curve To: S x2 y2, x y
  C: 6, // Curve To: C x1 y1, x2 y2, x y
  A: 7, // Arc To: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
} as const;

function toPathArray(commands: DrawCommand[], params: number[], formatter?: (n: number) => string): string[] {
  const path: string[] = [];

  let i = 0;
  for (const c of commands) {
    let buf = c;
    for (const j = i + ARGS_COUNT[c]; i < j; i++) {
      buf += ' ' + (formatter ? formatter(params[i]) : params[i].toString());
    }
    path.push(buf);
  }
  return path;
}

export function makeInterpolator(
  src: PathNode[],
  dst: PathNode[],
  options?: InterpolatorOptions
): (t: number) => string[] {
  const commands: DrawCommand[] = [];
  const srcParams: number[] = [];
  const dstParams: number[] = [];

  const [a, b] = align(src, dst, options);

  for (let i = 0; i < a.length; i++) {
    commands.push(a[i].name);
    getParams(a[i], srcParams);
    getParams(b[i], dstParams);
  }

  return (t: number): string[] => {
    let params = srcParams;
    if (t >= 1) {
      params = dstParams;
    } else if (t > 0) {
      params = srcParams.map((value, index) => lerp(value, dstParams[index], t));
    }
    return toPathArray(commands, params, options?.formatter);
  };
}
