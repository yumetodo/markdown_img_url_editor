const bs = require('@extra-array/binary-search.closest');
const impl = require('./src/impl');
/**
 * edit markdown img src
 * @param {string} markdownText markdown text
 * @param {(src: string)=>Promise<String>} converter acccept markdown img src and convert
 * @param {()=>Promise<void> | null | undefined} beforeCollectCallback called before collect convert result
 * @returns {string}
 */
const markdownImgUrlEditor = async (markdownText, converter, beforeCollectCallback) => {
  /** @types {(number | string)[]} */
  let strings = [];
  /** @types {Promise<string>[]} */
  let promiseStrings = [];
  const lineEndList = impl.listUpLineEnd(markdownText);
  const paragraphList = impl.listUpParagraphDelim(lineEndList);
  const codeBlockRangeList = impl.listUpCodeBlockRange(markdownText, lineEndList);
  const codeRangeList = impl.listUpCodeRange(markdownText, paragraphList, codeBlockRangeList);
  let imageBlockBeginPos = 0,
    codeBlockRangeHintPos = 0,
    codeRangeHintPos = 0,
    pre = 0;
  /**
   * skip code tag
   * @param {number} pos
   * @returns {boolean}
   */
  const skipCode = pos => {
    const [inCodeBlockRange, index1] = impl.isInRange(codeBlockRangeList, pos, codeBlockRangeHintPos);
    if (inCodeBlockRange) {
      imageBlockBeginPos = codeBlockRangeList[index1][1] + 1;
      codeBlockRangeHintPos = index1 + 1;
      return true;
    }
    const [inCodeRange, index2] = impl.isInRange(codeRangeList, pos, codeRangeHintPos);
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
     * @param {number} pos
     * @param {string} searchStr
     */
    const find = (pos, searchStr) => {
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
};
module.exports = markdownImgUrlEditor;
