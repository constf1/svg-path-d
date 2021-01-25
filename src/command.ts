/**
 * SVG path draw commands
 */

export type MoveTo = {
  name: 'M';
  x: number;
  y: number;
};

export type LineTo = {
  name: 'L';
  x: number;
  y: number;
};

export type HLineTo = {
  name: 'H';
  x: number;
};

export type VLineTo = {
  name: 'V';
  y: number;
};

export type ClosePath = {
  name: 'Z';
};

export type CurveTo = {
  name: 'C';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x: number;
  y: number;
};

export type SmoothCurveTo = {
  name: 'S';
  x2: number;
  y2: number;
  x: number;
  y: number;
};

export type QCurveTo = {
  name: 'Q';
  x1: number;
  y1: number;
  x: number;
  y: number;
};

export type SmoothQCurveTo = {
  name: 'T';
  x: number;
  y: number;
};

export type EllipseShape = {
  rx: number;
  ry: number;
  angle: number;
  largeArcFlag: boolean;
  sweepFlag: boolean;
};

export type EllipticalArc = EllipseShape & {
  name: 'A';
  x: number;
  y: number;
};

export type DrawTo =
  | MoveTo
  | LineTo
  | HLineTo
  | VLineTo
  | ClosePath
  | CurveTo
  | SmoothCurveTo
  | QCurveTo
  | SmoothQCurveTo
  | EllipticalArc;
export type DrawCommand = DrawTo['name'];

export function createDrawItem(name: DrawCommand, args: ReadonlyArray<number | string>): DrawTo {
  switch (name) {
    case 'H':
      return { name, x: +args[0] };
    case 'V':
      return { name, y: +args[0] };
    case 'M':
    case 'L':
    case 'T':
      return { name, x: +args[0], y: +args[1] };
    case 'Q':
      return { name, x1: +args[0], y1: +args[1], x: +args[2], y: +args[3] };
    case 'S':
      return { name, x2: +args[0], y2: +args[1], x: +args[2], y: +args[3] };
    case 'C':
      return { name, x1: +args[0], y1: +args[1], x2: +args[2], y2: +args[3], x: +args[4], y: +args[5] };
    case 'A':
      return {
        name,
        rx: +args[0],
        ry: +args[1],
        angle: +args[2],
        largeArcFlag: +args[3] === 1,
        sweepFlag: +args[4] === 1,
        x: +args[5],
        y: +args[6],
      };
    default:
      return { name };
  }
}
