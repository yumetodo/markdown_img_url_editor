import { MarkdownImgUrlEditor } from '../dist/index';
import MarkdownIt from 'markdown-it';
import TextCache from 'verifiable-file-read-all-cache';
const text2 = new TextCache(
  './test/input/text2.md',
  'd270ba28b95e9f256ca2eb993fc0692b9d755c4b397f75ea2d5deb5cf39c49f1'
);
const forVerifier = (actual: string, expected: string) => expect(actual).toEqual(expected);
describe('index', () => {
  it('parse', async () => {
    await text2.verify(forVerifier);
    const re: string[][] = [];
    const markdownImgUrlEditor = await MarkdownImgUrlEditor.init(await text2.get(), (a, s) => {
      re.push([a, s]);
      return () => s;
    });
    markdownImgUrlEditor.free();
    expect(re).toEqual([
      ['Mark Wubben', 'https://github.com/novemberborn.png?size=100'],
      ['Sindre Sorhus', 'https://github.com/sindresorhus.png?size=100'],
      ['Vadim Demedes', 'https://github.com/vadimdemedes.png?size=100'],
    ]);
  });
  it('join', async () => {
    await text2.verify(forVerifier);
    const markdownImgUrlEditor = await MarkdownImgUrlEditor.init(await text2.get(), (_, s) => {
      return () => s;
    });
    const md = new MarkdownIt();
    expect(md.render(markdownImgUrlEditor.replace())).toEqual(md.render(await text2.get()));
  });
});
