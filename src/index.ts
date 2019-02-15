// import * as bs from '@extra-array/binary-search.closest';
import { binarySearch as bs } from './binary-search.closest';
import { Impl } from './impl';
/**
 * edit markdown img src
 * @param  markdownText markdown text
 * @param converter acccept markdown img src and convert
 * @param beforeCollectCallback called before collect convert result
 */
export async function markdownImgUrlEditor(
  markdownText: string,
  converter: (src: string) => Promise<string>,
  beforeCollectCallback: () => void
): Promise<string> {
  let strings: (number | string)[] = [];
  let promiseStrings: Promise<string>[] = [];
  const lineEndList = Impl.listUpLineEnd(markdownText);
  const codeBlockByIndentRange = Impl.listUpCodeBlockRangeMadeByIndent(markdownText, lineEndList);
  const paragraphList = Impl.listUpParagraphDelim(lineEndList, codeBlockByIndentRange);
  const codeBlockRangeList = Impl.listUpCodeBlockRange(markdownText, lineEndList);
  const codeRangeList = Impl.listUpCodeRange(markdownText, paragraphList, codeBlockRangeList);
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
    const lineEndPos = bs(lineEndList, imageBlockBeginPos);
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
    const imageBlockAltLastPosResult = find(imageBlockBeginPos + 2, '](');
    if (null === imageBlockAltLastPosResult) continue;
    if (-1 === imageBlockAltLastPosResult) break;
    const imageBlockLastPosResult = find(imageBlockAltLastPosResult + 2, ')');
    if (null === imageBlockLastPosResult) continue;
    if (-1 === imageBlockLastPosResult) break;
    //append before image URL
    strings.push(markdownText.substring(pre, imageBlockAltLastPosResult + 2));
    pre = imageBlockLastPosResult;
    promiseStrings.push(converter(markdownText.substring(imageBlockAltLastPosResult + 2, imageBlockLastPosResult)));
    strings.push(promiseStrings.length - 1);
  }
  //append rest
  strings.push(markdownText.substring(pre));
  if (null != beforeCollectCallback) await beforeCollectCallback();
  const promiseResultStrings = await Promise.all(promiseStrings);
  return strings.map(e => (typeof e === 'number' ? promiseResultStrings[e] : e)).join('');
}
