// import * as bs from '@extra-array/binary-search.closest';
import { binarySearch as bs } from './binary-search.closest';
import { Impl } from './impl';
import deepFreeze from 'deep-freeze';

type stringGeneratorType = () => string;
/**
 * edit markdown img src
 * @param  markdownText markdown text
 * @param converter acccept markdown img src and convert
 * @param beforeCollectCallback called before collect convert result
 */
export async function markdownImgUrlEditor(
  markdownText: string,
  converter: (src: string) => stringGeneratorType,
  beforeCollectCallback?: () => Promise<void>
): Promise<string> {
  let strings: (number | string)[] = [];
  let stringsGenerator: stringGeneratorType[] = [];
  const lineEndList: ReadonlyArray<number> = deepFreeze(Impl.listUpLineEnd(markdownText));
  const codeBlockRangeList: ReadonlyArray<ReadonlyArray<number>> = deepFreeze(
    Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
      markdownText,
      lineEndList,
      Impl.listUpCodeBlockRange(markdownText, lineEndList)
    )
  );
  const paragraphList: ReadonlyArray<ReadonlyArray<number>> = deepFreeze(
    Impl.listUpParagraphDelim(lineEndList, codeBlockRangeList)
  );
  const codeRangeList: ReadonlyArray<ReadonlyArray<number>> = deepFreeze(
    Impl.listUpCodeRange(markdownText, paragraphList, codeBlockRangeList)
  );
  let imageBlockBeginPos = 0,
    codeBlockRangeHintPos = 0,
    codeRangeHintPos = 0,
    pre = 0;
  /**
   * skip code tag
   * @param pos
   */
  const skipCode = (pos: number): boolean => {
    const [inCodeBlockRange, index1] = Impl.isInRange(codeBlockRangeList, pos, codeBlockRangeHintPos);
    if (inCodeBlockRange) {
      imageBlockBeginPos = codeBlockRangeList[index1][1] + 1;
      codeBlockRangeHintPos = index1 + 1;
      return true;
    }
    const [inCodeRange, index2] = Impl.isInRange(codeRangeList, pos, codeRangeHintPos);
    if (inCodeRange) {
      imageBlockBeginPos = codeRangeList[index2][1] + 1;
      codeRangeHintPos = index2 + 1;
    }
    return inCodeRange;
  };
  while (-1 != (imageBlockBeginPos = markdownText.indexOf('![', imageBlockBeginPos))) {
    if (skipCode(imageBlockBeginPos)) continue;
    const lineEndPosIndex = bs(lineEndList, imageBlockBeginPos);
    if (-1 === lineEndPosIndex) continue;
    const lineEndPos = lineEndList[lineEndPosIndex];
    /**
     * find, skip, happy!
     * @param pos
     * @param searchStr
     */
    const find = (pos: number, searchStr: string) => {
      while (
        -1 !== (pos = markdownText.indexOf(searchStr, pos)) &&
        pos < lineEndPos &&
        '\\' === markdownText.charAt(pos)
      );
      if (-1 === pos) {
        return pos;
      }
      if (skipCode(pos)) return null;
      if (lineEndPos <= pos) {
        imageBlockBeginPos = lineEndPos + 1;
        return null;
      }
      return pos;
    };
    const imageBlockAltEndPosResult = find(imageBlockBeginPos + 2, '](');
    if (null === imageBlockAltEndPosResult) continue;
    if (-1 === imageBlockAltEndPosResult) break;
    const imageBlockLastPosResult = find(imageBlockAltEndPosResult + 2, ')');
    if (null === imageBlockLastPosResult) continue;
    if (-1 === imageBlockLastPosResult) break;
    //append before image URL
    strings.push(markdownText.substring(pre, imageBlockAltEndPosResult + 2));
    pre = imageBlockLastPosResult;
    stringsGenerator.push(converter(markdownText.substring(imageBlockAltEndPosResult + 2, imageBlockLastPosResult)));
    strings.push(stringsGenerator.length - 1);
    imageBlockBeginPos = imageBlockLastPosResult + 1;
  }
  //append rest
  strings.push(markdownText.substring(pre));
  if (null != beforeCollectCallback) await beforeCollectCallback();
  const promiseResultStrings = stringsGenerator.map(g => g());
  return strings.map(e => (typeof e === 'number' ? promiseResultStrings[e] : e)).join('');
}
