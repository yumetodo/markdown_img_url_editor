const bs = require('@extra-array/binary-search.closest');
class Impl {
    /**
     * list up LF position
     * @param {string} s string
     */
    static listUpLineEnd(s) {
        let re = [];
        for(let i = 0; -1 !== (i = s.indexOf('\n', i)); ++i) {
            re.push(i);
        }
        if(re[re.length - 1] !== s.length) re.push(s.length);
        return re;
    }
    /**
     * list up paragraph
     * @param {number[]} lineEndList created by `listUpLineEnd`
     * @returns {number[][]} array of paragraph delim range
     */
    static listUpParagraphDelim(lineEndList) {
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
    }
    /**
     * list up code block range
     * @param {string} markdownText markdown text
     * @param {number[]} lineEndList lineEndList created by `listUpLineEnd`
     * @returns {number[][]} array of code block range
     */
    static listUpCodeBlockRange(markdownText, lineEndList) {
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
                } else if(
                    '\r' === markdownText.charAt(preLineEnd + 4) ||
                    '\n' === markdownText.charAt(preLineEnd + 4)
                ) {
                    re.push([beginPos, preLineEnd + 4]);
                }
            }
        }
        return re;
    }
    /**
     * find nearest paragraph end pos
     * @param {number[][]} paragraphList paragraphList created by `listUpParagraphDelim`
     * @param {number} pos
     * @param {number} begin search begin index in `paragraphList`
     * @returns {[number, number]} the pair of find nearest paragraph end pos and the index in `paragraphList`
     */
    static findNearestParagraphEndPos(paragraphList, pos, begin) {
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
    static listUpCodeRange(markdownText, paragraphList) {
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
            const [nearestParagraphEndPos, index] = this.findNearestParagraphEndPos(paragraphList, pre, hintPos);
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
    }
    /**
     * check weather pos is in range
     * @param {number[][]} rangeList array of range
     * @param {number} pos
     * @param {number} begin
     * @returns {[boolean, number]}
     */
    static isInRange(rangeList, pos, begin) {
        /** @types {number} */
        const index = bs(rangeList, pos, (a, b) => a[1] - b, null, begin);
        return [(rangeList[index][0] <= pos && pos <= rangeList[index][1]), index];
    }
}
module.exports = Impl;
