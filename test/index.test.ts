import { markdownImgUrlEditor } from '../src/index';
import TextCache from 'verifiable-file-read-all-cache';
const text2 = new TextCache(
  './test/input/text2.md',
  'd270ba28b95e9f256ca2eb993fc0692b9d755c4b397f75ea2d5deb5cf39c49f1'
);
const forVerifier = (actual: string, expected: string) => expect(actual).toEqual(expected);
describe('index', () => {
  it('parse', async () => {
    //npm run test -- --testNamePattern "parse"
    await text2.verify(forVerifier);
    let re: string[] = [];
    await markdownImgUrlEditor(await text2.get(), s => {
      re.push(s);
      return Promise.resolve(s);
    });
    expect(re).toEqual([
      'https://github.com/novemberborn.png?size=100',
      'https://github.com/sindresorhus.png?size=100',
      'https://github.com/vadimdemedes.png?size=100',
    ]);
  });
});
