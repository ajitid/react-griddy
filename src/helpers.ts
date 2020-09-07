/**
 * Checks if code is running in development environment
 */
export const inDevelopment = () => process.env.NODE_ENV === "development";

/**
 * No operation
 *
 * Placeholder for function, or
 * use it if you want to pass a function but don't want any functionality in it
 */
export const noop = () => {};

type RangeFunction = (min: number, max: number, v: number) => any;

const curryRange = (func: RangeFunction) => (
  min: number,
  max: number,
  v?: number
) => (v != null ? func(min, max, v) : (cv: number) => func(min, max, cv));

const _clamp = (min: number, max: number, v: number) =>
  Math.min(Math.max(v, min), max);

export const clamp = curryRange(_clamp);

export class SetOperations {
  static union<T>(a: Set<T>, b: Set<T>) {
    return new Set([...a, ...b]);
  }

  static intersection<T>(a: Set<T>, b: Set<T>) {
    return new Set([...a].filter((x) => b.has(x)));
  }

  static difference<T>(a: Set<T>, b: Set<T>) {
    return new Set([...a].filter((x) => !b.has(x)));
  }
}
