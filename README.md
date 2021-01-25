# svg-path-d
SVG path data ('d' attribute) manipulation library.
## The d attribute defines a path to be drawn.
A path definition is a list of path commands where each command is composed of a command letter and numbers that represent the command parameters. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d)
# Installation
```
npm i svg-path-d
```
# Usage

## Step 1: Import the library.
```ts
import * as SPD from "svg-path-d";
```

## Step 2: Create a PathNode array.
The `PathNode[]` is used to represent and manipulate a sequence of path draw commands.
It can be created from a string via the `fromString(pathData: string): PathNode[]` method.

```ts
let heart = "M50 30a20 20 0 0140 0q0 30-40 60-40-30-40-60a20 20 0 0140 0z";
let path = SPD.fromString(heart);
```

It also can be programmatically generated on the fly.
```ts
function createHeart(cx: number, cy: number, r: number): SPD.PathNode[] {
  return SPD.makePath([
    { name: "M", x: cx, y: cy - r },
    {
      name: "A",
      rx: r,
      ry: r,
      angle: 0,
      largeArcFlag: false,
      sweepFlag: true,
      x: cx + 2 * r,
      y: cy - r
    },
    {
      name: "Q",
      x1: cx + 2 * r,
      y1: cy + r / 2,
      x: cx,
      y: cy + 2 * r
    },
    {
      name: "Q",
      x1: cx - 2 * r,
      y1: cy + r / 2,
      x: cx - 2 * r,
      y: cy - r
    },
    {
      name: "A",
      rx: r,
      ry: r,
      angle: 0,
      largeArcFlag: false,
      sweepFlag: true,
      x: cx,
      y: cy - r
    },
    { name: "Z" }
  ]);
}
```

This can also be done with `PathBuilder`.

```ts
function createHeart(
  cx: number,
  cy: number,
  r: number
): SPD.PathNode[] {
  return new SPD.PathBuilder()
    .M(cx, cy - r)
    .a(r, r, 0, 0, 1, 2 * r, 0)
    .q(0, (3 * r) / 2, -2 * r, 3 * r)
    .q(-2 * r, (-3 * r) / 2, -2 * r, -3 * r)
    .a(r, r, 0, 0, 1, 2 * r, 0)
    .z().path;
}
```

## Step 3: Path manipulation.
Path manipulation (or path handling) is the process of changing, transforming, splitting or analyzing paths.

### Simple In-Place Transformations.
  * `applyTranslate(item: DrawTo, dx: number, dy: number): void`;
  * `applyVerticalFlip(item: DrawTo): void`;
  * `applyHorizontalFlip(item: DrawTo): void`;

### Create Transformed `PathNode[]`.
  * `createTransformed(path: PathNode[], matrix: ReadonlyMatrix): PathNode[]`;
  * `createReversed(items: PathNode[]): PathNode[]`;

```ts
// TODO: Add path node manipulation examples here. (splitter/promoter/bounding-rect)
```

## Step 4: Converting PathNode arrays back into strings.

There are two functions which can convert to string individual path draw commands:
 * `asString(item: Readonly<DrawTo>, fractionDigits = -1): string`;
 * `asRelativeString(item: Readonly<PathNode>, fractionDigits = -1): string`;

So we can convert a `PathNode[]` with a desired precision:
```ts
const PRECISION = 3;

function pathToString(path: SPD.PathNode[]): string {
  return path.map(item => SPD.asString(item, PRECISION)).join("");
}

function pathToRelativeString(path: SPD.PathNode[]): string {
  return path.map(item => SPD.asRelativeString(item, PRECISION)).join("");
}

function pathToShortestString(path: SPD.PathNode[]): string {
  return path
    .map(item => {
      const s1 = SPD.asString(item, PRECISION);
      const s2 = SPD.asRelativeString(item, PRECISION);
      return s1.length < s2.length ? s1 : s2;
    })
    .join("");
}
```

## Examples

### Example #1. A heart with a triangle.

<details>
<summary>code</summary>
<p>

```ts
const heart = "M10 30a20 20 0 01 40 0 20 20 0 01 40 0q0 30-40 60-40-30-40-60z";

const pathHeart = SPD.fromString(heart);
const pathTriangle = SPD.createReveresed(SPD.makePath(pathHeart.map(toLine)));

const triangle = pathTriangle.map(item => SPD.asString(item)).join("");

const box = SPD.getBoundingRect(pathHeart);

const appDiv: HTMLElement = document.getElementById("app");
appDiv.innerHTML = `
  <h1>Heart</h1>
  <div>
    <svg viewBox="${toViewBox(
      box.left - 1,
      box.top - 1,
      box.right - box.left + 2,
      box.bottom - box.top + 2
    )}">
      <path fill="red" d="${heart + triangle}"/>
    </svg>
  </div>
`;

function toLine(item: SPD.PathNode): SPD.PathNode {
  return SPD.isClosePath(item) || SPD.isMoveTo(item)
    ? { ...item }
    : { name: "L", x: SPD.getX(item), y: SPD.getY(item) };
}

function toViewBox(x: number, y: number, width: number, height: number) {
  return `${x} ${y} ${width} ${height}`;
}
```

</p>
</details>

### Example #2. From a heart to a triangle.

<details>
<summary>code</summary>
<p>

```ts
// ...
const pathHeart = SPD.fromString(heart);
const pathTriangle = SPD.makePath(pathHeart.map(toLine));
const morph = SPD.makeInterpolator(pathHeart, pathTriangle);

const src = morph(0).join("");
const dst = morph(1).join("");

const box = SPD.getBoundingRect(pathHeart);

const appDiv: HTMLElement = document.getElementById("app");
appDiv.innerHTML = `
  <h1>Heart Morph</h1>
  <div>
    <svg viewBox="${toViewBox(
      box.left - 1,
      box.top - 1,
      box.right - box.left + 2,
      box.bottom - box.top + 2
    )}">
      <path fill="red" d="${src}">
        <animate id="animate1" begin="1s;animate2.end + 2s" repeatCount="1" fill="freeze" attributeName="d" dur="1s"
          values="${src}; ${dst}" />
        <animate id="animate2" begin="animate1.end + 2s" repeatCount="1" fill="freeze" attributeName="d" dur="1s"
          values="${dst}; ${src}" />
      </path>
    </svg>
  </div>
`;
// ...
```

</p>
</details>
