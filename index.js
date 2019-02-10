const bs = require('@extra-array/binary-search.closest');
/**
 * list up LF position
 * @param {string} s string
 */
const listUpLineEnd = (s) => {
    let re = [];
    for(let i = 0; -1 !== (i = s.indexOf('\n')); ++i) {
        re.push(i);
    }
    return re;
};
/**
 * list up paragraph
 * @param {number[]} lineEndList created by `listUpLineEnd`
 * @returns {number[][]} array of paragraph delim range
 */
const listUpParagraphDelim = (lineEndList) => {
    let re = [];
    /** @types {number|null} */
    let pre = null;
    for(const n of lineEndList) {
        if(null === pre) {
            pre = n;
            continue;
        }
        if(pre + 1 === n) {
            if (re[re.length - 1][1] === pre) {
                re[re.length - 1][1] = n;
            } else {
                re.push([pre, n]);
            }
        }
        pre = n;
    }
    const last = lineEndList[lineEndList.length -1];
    if(re[re.length - 1][1] !== last) {
        re.push([last, last]);
    }
    return re;
};
/**
 * list up code block range
 * @param {string} markdownText markdown text
 * @param {number[]} lineEndList lineEndList created by `listUpLineEnd`
 * @returns {number[][]} array of code block range
 */
const listUpCodeBlockRange = (markdownText, lineEndList) => {
    /** @types {number[][]} */
    let re = [];
    /** @types {number | null} */
    let beginPos = null;
    if(markdownText.startsWith('```')) {
        beginPos = 0;
    }
    for(const preLineEnd of lineEndList) {
        if(markdownText.startsWith('```', preLineEnd + 1)) {
            if(null === beginPos) {
                beginPos = preLineEnd + 1;
            } else if('\r' === markdownText.charAt(preLineEnd + 4) || '\n' === markdownText.charAt(preLineEnd + 4)) {
                re.push([beginPos, preLineEnd + 4]);
            }
        }
    }
    return re;
};
/**
 * find nearest paragraph end pos
 * @param {number[][]} paragraphList paragraphList created by `listUpParagraphDelim`
 * @param {number} pos
 * @param {number} begin search begin index in `paragraphList`
 * @returns {[number, number]} the pair of find nearest paragraph end pos and the index in `paragraphList`
 */
const findNearestParagraphEndPos = (paragraphList, pos, begin) => {
    /** @types {number} */
    const index = bs(paragraphList, pos, (a, b) => a[0] - b, null, begin);
    return [paragraphList[index][0], index];
}
/**
 * list up code tag range
 * @param {string} markdownText markdown text
 * @param {number[][]} paragraphList created by `listUpParagraphDelim`
 * @returns {number[][]} array of code tag range
 */
const listUpCodeRange = (markdownText, paragraphList) => {
    /** @types {number[][]} */
    let re = [];
    /** @types {number|null} */
    let pre = null;
    let hintPos = 0;
    for(let pos = 0; -1 !== (pos = markdownText.indexOf('`', pos)); ++pos) {
        if(pre === null) {
            pre = pos;
            continue;
        }
        const [nearestParagraphEndPos, index] = findNearestParagraphEndPos(paragraphList, pre, hintPos);
        if(nearestParagraphEndPos < pos) {
            pre = pos;
            hintPos = index;
        } else {
            re.push([pre, pos]);
            pre = null;
            hintPos = Math.max(0, index - 1);
        }
    }
    return re;
};
/**
 * check weather pos is in range
 * @param {number[][]} rangeList array of range
 * @param {number} pos
 * @param {number} begin
 * @returns {[boolean, number]}
 */
const isInRange = (rangeList, pos, begin) => {
    /** @types {number} */
    const index = bs(rangeList, pos, (a, b) => a[1] - b, null, begin);
    return [(rangeList[index][0] <= pos && pos <= rangeList[index][1]), index];
}
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
    const lineEndList = listUpLineEnd(markdownText);
    const paragraphList = listUpParagraphDelim(lineEndList);
    const codeRangeList = listUpCodeRange(markdownText, paragraphList);
    const codeBlockRangeList = listUpCodeBlockRange(markdownText, lineEndList);
    let imageBlockBeginPos = 0, codeBlockRangeHintPos = 0, codeRangeHintPos = 0, pre = 0;
    /**
     * skip code tag
     * @param {number} pos
     * @returns {boolean}
     */
    const skipCode = (pos) => {
        const [inCodeBlockRange, index1] = isInRange(codeBlockRangeList, pos, codeBlockRangeHintPos);
        if(inCodeBlockRange) {
            imageBlockBeginPos = codeBlockRangeList[index1][1] + 1;
            codeBlockRangeHintPos = index1 + 1;
            return true;
        }
        const [inCodeRange, index2] = isInRange(codeRangeList, pos, codeRangeHintPos);
        if(inCodeRange) {
            imageBlockBeginPos = codeRangeList[index2][1] + 1;
            codeRangeHintPos = index2 + 1;
        }
        return inCodeRange;
    };
    while(-1 != (imageBlockBeginPos = markdownText.indexOf('![', imageBlockBeginPos))) {
        if(skipCode(imageBlockBeginPos)) continue;
        const lineEndPos = bs(lineEndList, imageBlockBeginPos);
        /**
         * find, skip, happy!
         * @param {number} pos
         * @param {string} searchStr
         */
        const find = (pos, searchStr) => {
            while(
                -1 !== (pos = markdownText.indexOf(searchStr, pos)) &&
                pos < lineEndPos &&
                '\\' === markdownText.charAt(pos)
            );
            if(-1 === pos) {
                return pos;
            }
            if(skipCode(pos)) return null;
            if(lineEndPos <= pos) {
                imageBlockBeginPos = lineEndPos + 1;
                return null;
            }
            return pos;
        };
        const imageBlockAltLastPosResult = find(imageBlockBeginPos + 2, '](');
        if(null === imageBlockAltLastPosResult) continue;
        if(-1 === imageBlockAltLastPosResult) break;
        const imageBlockLastPosResult = find(imageBlockAltLastPosResult + 2, ')');
        if(null === imageBlockLastPosResult) continue;
        if(-1 === imageBlockLastPosResult) break;
        //append before image URL
        strings.push(markdownText.substring(pre, imageBlockAltLastPosResult + 2));
        pre = imageBlockLastPosResult;
        promiseStrings.push(
            converter(markdownText.substring(imageBlockAltLastPosResult + 2, imageBlockLastPosResult))
        );
        strings.push(promiseStrings.length - 1);
    }
    //append rest
    strings.push(markdownText.substring(pre));
    if(null != beforeCollectCallback) await beforeCollectCallback();
    const promiseResultStrings = await Promise.all(promiseStrings);
    return strings.map(e => typeof(e) === 'number' ? promiseResultStrings[e] : e).join('');
};
module.exports = markdownImgUrlEditor;
