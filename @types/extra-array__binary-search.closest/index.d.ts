export = binarySearch;
declare function binarySearch<T, U>(
    arr: T[],
    val: T,
    fn?: null,
    ths?: any,
    bgn?: number,
    end?: number
): number;
declare function binarySearch<T, U>(
    arr: T[],
    val: U,
    fn: (e: T, v: U, m?: number, arr?: T[]) => number,
    ths?: any,
    bgn?: number,
    end?: number
): number;
// declare module "@extra-array/binary-search.closest" {
//     interface binary-search.closest {
//         (str: string): string;
//     }

//     const scoped: binary-search.closest;

//     export = scoped;
// }