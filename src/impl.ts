// import * as bs from '@extra-array/binary-search.closest';
import { binarySearchCustom as bs } from './binary-search.closest';
import Zs from 'unicode/category/Zs';
import * as std from 'es-string-algorithm';
const whiteSpace =
  Object.entries(Zs)
    .map((e: [string, typeof Zs[0]]) => e[1].symbol)
    .join('') + '\u{0009}\u{000B}\u{000C}';
export namespace Impl {
  /**
   * list up LF position
   * @param s string
   */
  export function listUpLineEnd(s: string): number[] {
    let re: number[] = [];
    for (let i = 0; -1 !== (i = s.indexOf('\n', i)); ++i) {
      re.push(i);
    }
    if (re[re.length - 1] !== s.length) re.push(s.length);
    return re;
  }
  /**
   * list up code block range made by indent
   * @param markdownText markdown text
   * @param lineEndList created by `listUpLineEnd`
   * @returns array of code block range
   */
  export function listUpCodeBlockRangeMadeByIndent(markdownText: string, lineEndList: number[]): number[][] {
    let re: number[][] = [];
    let preLineEnd = 0;
    let pre: number | null = null;
    let needNotToAppend = false;
    let prevLineIsBlank = false;
    for (const lineEnd of lineEndList) {
      const lineFront = preLineEnd + 1;
      if (
        (prevLineIsBlank || null !== pre || needNotToAppend) &&
        lineFront + 4 <= std.findFirstNotOf(markdownText, whiteSpace, lineFront)
      ) {
        if (needNotToAppend) {
          re[re.length - 1][1] = lineEnd - 1;
          needNotToAppend = true;
        } else if (null === pre) {
          pre = lineFront;
          needNotToAppend = false;
        } else {
          re.push([pre, lineEnd - 1]);
          pre = null;
          needNotToAppend = true;
        }
        prevLineIsBlank = false;
      } else {
        prevLineIsBlank = lineEnd === std.findFirstNotOf(markdownText, whiteSpace, lineFront);
        if (!prevLineIsBlank) needNotToAppend = false;
      }
      preLineEnd = lineEnd;
    }
    if (null !== pre) {
      re.push([pre, preLineEnd - 1]);
    }
    return re;
  }
  /**
   * check weather pos is in range
   * @param rangeList array of range
   * @param pos
   * @param begin
   */
  export function isInRange(rangeList: number[][], pos: number, begin: number): [boolean, number] {
    if (0 === rangeList.length) return [false, 0];
    const index = bs(rangeList, pos, (a, b) => a[1] - b, null, begin);
    if (rangeList.length <= index) return [false, 0];
    return [rangeList[index][0] <= pos && pos <= rangeList[index][1], index];
  }
  /**
   * list up paragraph
   * @param lineEndList created by `listUpLineEnd`
   * @returns array of paragraph delim range
   */
  export function listUpParagraphDelim(lineEndList: number[], codeBlockByIndentRange: number[][]): number[][] {
    let re: number[][] = [];
    let pre: number | null = null;
    let hint = 0;
    for (const n of lineEndList) {
      if (null === pre) {
        pre = n;
        continue;
      }
      const [isCodeBlockByIndentRange, index] = isInRange(codeBlockByIndentRange, n, hint);
      if (pre + 1 === n && !isCodeBlockByIndentRange) {
        if (0 !== re.length && re[re.length - 1][1] === pre) {
          re[re.length - 1][1] = n;
        } else {
          re.push([pre, n]);
        }
      }
      hint = index;
      pre = n;
    }
    const last = lineEndList[lineEndList.length - 1];
    if (re[re.length - 1][1] !== last) {
      re.push([last, last]);
    }
    return re;
  }
  /**
   * list up code block range
   * @param markdownText markdown text
   * @param lineEndList lineEndList created by `listUpLineEnd`
   * @returns array of code block range
   */
  export function listUpCodeBlockRange(markdownText: string, lineEndList: number[]): number[][] {
    let re: number[][] = [];
    let beginPos: number | null = null;
    if (markdownText.startsWith('```')) {
      beginPos = 0;
    }
    for (const preLineEnd of lineEndList) {
      if (markdownText.startsWith('```', preLineEnd + 1)) {
        if (null === beginPos) {
          beginPos = preLineEnd + 1;
        } else if ('\r' === markdownText.charAt(preLineEnd + 4) || '\n' === markdownText.charAt(preLineEnd + 4)) {
          re.push([beginPos, preLineEnd + 4]);
          beginPos = null;
        }
      }
    }
    return re;
  }
  /**
   * find nearest paragraph end pos
   * @param paragraphList paragraphList created by `listUpParagraphDelim`
   * @param pos
   * @param begin search begin index in `paragraphList`
   * @returns the pair of find nearest paragraph end pos and the index in `paragraphList`
   */
  export function findNearestParagraphEndPos(paragraphList: number[][], pos: number, begin: number): [number, number] {
    const index = bs(paragraphList, pos, (a, b) => a[0] - b, null, begin);
    return [paragraphList[index][0], index];
  }
  /**
   * find nearest code block begin pos
   * @param codeBlockRangeList codeBlockRangeList created by `listUpCodeBlockRange`
   * @param pos
   * @param begin search begin index in `codeBlockRangeList`
   */
  export function findNearestCodeBlockBeginPos(
    codeBlockRangeList: number[][],
    pos: number,
    begin: number
  ): [boolean, number, number] {
    const index = bs(codeBlockRangeList, pos, (a, b) => a[0] - b, null, begin);
    return [
      codeBlockRangeList[index][0] <= pos && pos <= codeBlockRangeList[index][1],
      codeBlockRangeList[index][0],
      index,
    ];
  }
  /**
   * list up code tag range
   * @param markdownText markdown text
   * @param paragraphList created by `listUpParagraphDelim`
   * @param codeBlockRangeList created by `listUpCodeBlockRange`
   * @returns array of code tag range
   */
  export function listUpCodeRange(
    markdownText: string,
    paragraphList: number[][],
    codeBlockRangeList: number[][]
  ): number[][] {
    let re: number[][] = [];
    let paragraphListHintPos = 0;
    let codeBlockRangeHintPos = 0;
    for (let beginPos = 0; -1 !== (beginPos = markdownText.indexOf('`', beginPos)); ) {
      const [inCodeBlockRange1, nearestCodeBlockBeginPos, index1] = findNearestCodeBlockBeginPos(
        codeBlockRangeList,
        beginPos,
        codeBlockRangeHintPos
      );
      if (inCodeBlockRange1) {
        codeBlockRangeHintPos = index1 + 1;
        beginPos = codeBlockRangeList[index1][1] + 1;
        continue;
      }
      const endPos = std.findFirstNotOf(markdownText, '`', beginPos);
      const backtickLen = endPos - beginPos;
      const [nearestParagraphEndPos, index2] = findNearestParagraphEndPos(paragraphList, endPos, paragraphListHintPos);
      const otherBeginPos = markdownText.indexOf('`'.repeat(backtickLen), endPos);
      if (-1 === otherBeginPos) return re;
      codeBlockRangeHintPos = otherBeginPos < nearestCodeBlockBeginPos ? index1 : index1 + 1;
      paragraphListHintPos = otherBeginPos < nearestParagraphEndPos ? index2 : index2 + 1;
      if (otherBeginPos < nearestCodeBlockBeginPos && otherBeginPos < nearestParagraphEndPos) {
        re.push([beginPos, otherBeginPos + backtickLen - 1]);
        beginPos = otherBeginPos + backtickLen;
      } else {
        beginPos = Math.max(codeBlockRangeList[index1][1], paragraphList[index2][1]);
      }
    }
    return re;
  }
}
