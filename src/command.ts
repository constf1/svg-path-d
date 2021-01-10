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
