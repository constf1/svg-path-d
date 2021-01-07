import { DrawCommand } from './command';

const RE_COMMAND = /([MLHVZCSQTA])/gi;
const RE_FLAG = /[01]/;
const RE_SIGNED = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/;
const RE_UNSIGNED = /[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/;

/**
 * [Path Doc](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
 */
const REXPS: {[key in DrawCommand]: Readonly<RegExp[]>} = {
  // Move To:
  //  M x y
  //  m dx dy
  M: [RE_SIGNED, RE_SIGNED],

  // Line To:
  // L x y
  // l dx dy
  L: [RE_SIGNED, RE_SIGNED],

  // Horizontal Line To:
  // H x
  // h dx
  H: [RE_SIGNED],

  // Vertical Line To:
  // V y
  // v dy
  V: [RE_SIGNED],

  // Close Path.
  Z: [],

  // Bézier curves:

  // Curve To:
  // C x1 y1, x2 y2, x y
  // c dx1 dy1, dx2 dy2, dx dy
  C: [RE_SIGNED, RE_SIGNED, RE_SIGNED, RE_SIGNED, RE_SIGNED, RE_SIGNED],

  // Shortcut Curve To:
  // S x2 y2, x y
  // s dx2 dy2, dx dy
  S: [RE_SIGNED, RE_SIGNED, RE_SIGNED, RE_SIGNED],

  // Quadratic Curve To:
  // Q x1 y1, x y
  // q dx1 dy1, dx dy
  Q: [RE_SIGNED, RE_SIGNED, RE_SIGNED, RE_SIGNED],

  // Shortcut Quadratic Curve To:
  // T x y
  // t dx dy
  T: [RE_SIGNED, RE_SIGNED],

  // Arc To:
  // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  // a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
  A: [RE_UNSIGNED, RE_UNSIGNED, RE_SIGNED, RE_FLAG, RE_FLAG, RE_SIGNED, RE_SIGNED],
};

/**
 * Helper class.
 */
class Reader {
  // tslint:disable-next-line: variable-name
  private _data = '';

  set data(value: string) {
    this._data = value.trim();
  }

  get data() {
    return this._data;
  }

  moveTo(start: number) {
    this.data = this.data.slice(start);
  }

  read(exp: RegExp): string | null {
    exp.lastIndex = 0;
    const m = exp.exec(this.data);
    if (m !== null) {
      const value = m[0];
      this.moveTo(m.index + value.length);
      return value;
    }
    return null;
  }

  readAll(exps: Readonly<RegExp[]>): string[] | null {
    const buf: string[] = [];
    for (const exp of exps) {
      const value = this.read(exp);
      if (value !== null) {
        buf.push(value);
      } else {
        return null;
      }
    }
    return buf;
  }
}

export type DrawToken = {
  name: DrawCommand;
  args: string[];
  relative?: boolean;
};

export function getTokens(pathData: string): DrawToken[] {
  const tokens: DrawToken[] = [];

  // Split by command.
  const split = pathData.split(RE_COMMAND);
  const reader = new Reader();

  for (let i = 2; i < split.length; i += 2) {
    let command = split[i - 1];
    reader.data = split[i];

    while (true) {
      const name = command.toUpperCase() as DrawCommand;
      const relative = name !== command;
      const args = reader.readAll(REXPS[name]);
      if (args !== null) {
        tokens.push({ name, relative, args });
      } else {
        // console.warn('Couldn\'t properly parse this expression:', reader.data);
        break;
      }
      if (!reader.data || args.length === 0) {
        break;
      } else {
        if (command === 'M') {
          command = 'L';
        } else if (command === 'm') {
          command = 'l';
        }
      }
    }
  }

  return tokens;
}
