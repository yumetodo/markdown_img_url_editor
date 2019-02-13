export declare namespace Impl {
    /**
     * list up LF position
     * @param s string
     */
    function listUpLineEnd(s: string): number[];
    /**
     * list up paragraph
     * @param lineEndList created by `listUpLineEnd`
     * @returns array of paragraph delim range
     */
    function listUpParagraphDelim(lineEndList: number[]): number[][];
    /**
     * list up code block range
     * @param markdownText markdown text
     * @param lineEndList lineEndList created by `listUpLineEnd`
     * @returns array of code block range
     */
    function listUpCodeBlockRange(markdownText: string, lineEndList: number[]): number[][];
    /**
     * find nearest paragraph end pos
     * @param paragraphList paragraphList created by `listUpParagraphDelim`
     * @param pos
     * @param begin search begin index in `paragraphList`
     * @returns the pair of find nearest paragraph end pos and the index in `paragraphList`
     */
    function findNearestParagraphEndPos(paragraphList: number[][], pos: number, begin: number): [number, number];
    /**
     * find nearest code block begin pos
     * @param codeBlockRangeList codeBlockRangeList created by `listUpCodeBlockRange`
     * @param pos
     * @param begin search begin index in `codeBlockRangeList`
     */
    function findNearestCodeBlockBeginPos(codeBlockRangeList: number[][], pos: number, begin: number): [boolean, number, number];
    /**
     * list up code tag range
     * @param markdownText markdown text
     * @param paragraphList created by `listUpParagraphDelim`
     * @param codeBlockRangeList created by `listUpCodeBlockRange`
     * @returns array of code tag range
     */
    function listUpCodeRange(markdownText: string, paragraphList: number[][], codeBlockRangeList: number[][]): number[][];
    /**
     * check weather pos is in range
     * @param rangeList array of range
     * @param pos
     * @param begin
     */
    function isInRange(rangeList: number[][], pos: number, begin: number): [boolean, number];
}
