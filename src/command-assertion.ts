import {
  ClosePath,
  CurveTo,
  DrawTo,
  EllipticalArc,
  HLineTo,
  LineTo,
  MoveTo,
  QCurveTo,
  SmoothCurveTo,
  SmoothQCurveTo,
  VLineTo,
} from './command';

// Type Guards:
export function isMoveTo(item: DrawTo): item is MoveTo {
  return item.name === 'M';
}

export function isLineTo(item: DrawTo): item is LineTo {
  return item.name === 'L';
}

export function isHLineTo(item: DrawTo): item is HLineTo {
  return item.name === 'H';
}

export function isVLineTo(item: DrawTo): item is VLineTo {
  return item.name === 'V';
}

export function isClosePath(item: DrawTo): item is ClosePath {
  return item.name === 'Z';
}

export function isCurveTo(item: DrawTo): item is CurveTo {
  return item.name === 'C';
}

export function isSmoothCurveTo(item: DrawTo): item is SmoothCurveTo {
  return item.name === 'S';
}

export function isQCurveTo(item: DrawTo): item is QCurveTo {
  return item.name === 'Q';
}

export function isSmoothQCurveTo(item: DrawTo): item is SmoothQCurveTo {
  return item.name === 'T';
}

export function isEllipticalArc(item: DrawTo): item is EllipticalArc {
  return item.name === 'A';
}

export function hasControlPoint1(item: DrawTo): item is CurveTo | QCurveTo {
  return isCurveTo(item) || isQCurveTo(item);
}

export function hasControlPoint2(item: DrawTo): item is CurveTo | SmoothCurveTo {
  return isCurveTo(item) || isSmoothCurveTo(item);
}

export function isBezierCurve(item: DrawTo): item is CurveTo | SmoothCurveTo | QCurveTo | SmoothQCurveTo {
  return isCurveTo(item) || isSmoothCurveTo(item) || isQCurveTo(item) || isSmoothQCurveTo(item);
}
