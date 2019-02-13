/**
 * edit markdown img src
 * @param  markdownText markdown text
 * @param converter acccept markdown img src and convert
 * @param beforeCollectCallback called before collect convert result
 */
export declare function markdownImgUrlEditor(markdownText: string, converter: (src: string) => Promise<string>, beforeCollectCallback: () => void): Promise<string>;
