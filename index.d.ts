/**
 * edit markdown img src
 * @param markdownText markdown text
 * @param converter converter acccept markdown img src and convert
 * @param beforeCollectCallback called before collect convert result
 */
declare function markdownImgUrlEditor(markdownText: string, converter: (src: string) => string | Promise<string>, beforeCollectCallback: () => void): string