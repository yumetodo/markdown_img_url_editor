// MIT License
// Copyright (c) 2018 Merferry
export function binarySearch(
  arr: number[] | ReadonlyArray<number[]>,
  val: number,
  bgn: number = 0,
  end: number = arr.length
): number {
  while (bgn < end) {
    const m = (bgn + end) >>> 1;
    if (arr[m] < val) bgn = m + 1;
    else if (arr[m] > val) end = m;
    else return m;
  }
  return bgn;
}

export function binarySearchCustom<T, U>(
  arr: T[] | ReadonlyArray<T[]>,
  val: U,
  fn: (e: T, v: U, m?: number, arr?: T[]) => number,
  ths?: Function | null,
  bgn: number = 0,
  end: number = arr.length
): number {
  while (bgn < end) {
    const m = (bgn + end) >>> 1;
    const c = fn.call(ths, arr[m], val, m, arr);
    if (c < 0) bgn = m + 1;
    else if (c > 0) end = m;
    else return m;
  }
  return bgn;
}
