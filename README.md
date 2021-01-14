# svg-path-d
SVG path data ('d' attribute) manipulation library.
## The d attribute defines a path to be drawn.
A path definition is a list of path commands where each command is composed of a command letter and numbers that represent the command parameters. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d)
## Installation
```
npm i svg-path-d
```
## Usage
```ts
import * as SPD from "svg-path-d";
```

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
