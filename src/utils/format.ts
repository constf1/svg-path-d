/**
 * Returns a string representing a number in fixed-point notation.
 * @param value The number.
 * @param maximumFractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
 */
export function formatDecimal(value: number, maximumFractionDigits?: number): string {
  const str = value.toFixed(maximumFractionDigits);
  if (/\.\d*$/.test(str)) {
    let length = str.length;
    while (true) {
      if (str.endsWith('0', length)) {
        length--;
      } else {
        if (str.endsWith('.', length)) {
          length--;
        }
        break;
      }
    }
    if (length < str.length) {
      return str.substring(0, length);
    }
  }
  return str;
}
