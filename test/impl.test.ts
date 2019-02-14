import { Impl } from '../src/impl';
import TextCache from 'verifiable-file-read-all-cache';
// const TextCache = require('verifiable-file-read-all-cache');
describe('impl', async () => {
  const text1 = `arikitari
na
sekai`;
  it('Impl.listUpLineEnd', () => {
    const re = Impl.listUpLineEnd(text1);
    expect(re.length).toEqual(3);
    expect(re).toEqual([9, 12, 18]);
  });
  const text2 = new TextCache(
    './test/input/text2.md',
    'd270ba28b95e9f256ca2eb993fc0692b9d755c4b397f75ea2d5deb5cf39c49f1'
  );
  const text3 = new TextCache(
    './test/input/text3.md',
    '4371078c8122b4320a1ed29289118ecd3a7fb8b6a7a3c524305a66f6c4e3341e'
  );
  const forVerifier = (actual: string, expected: string) => expect(actual).toEqual(expected);
  it('Impl.listUpParagraphDelim', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList = Impl.listUpLineEnd(text);
    const re = Impl.listUpParagraphDelim(lineEndList);
    expect(re).toEqual([
      [8, 9],
      [41, 42],
      [70, 71],
      [149, 150],
      [271, 272],
      [301, 302],
      [336, 337],
      [345, 346],
      [788, 789],
    ]);
  });
  test('Impl.listUpCodeBlockRange', async () => {
    await text2.verify(forVerifier);
    const text = await Promise.all([text2.get(), text3.get()]);
    const re = Impl.listUpCodeBlockRange(text[0], Impl.listUpLineEnd(text[0]));
    expect(re).toEqual([[43, 70], [151, 271], [303, 336]]);
  });
  it('Impl.findNearestParagraphEndPos', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList = Impl.listUpLineEnd(text);
    const paragraphList = Impl.listUpParagraphDelim(lineEndList);
    const re1 = Impl.findNearestParagraphEndPos(paragraphList, 87, 0);
    expect(re1).toEqual([149, 3]);
    const re2 = Impl.findNearestParagraphEndPos(paragraphList, 176, re1[1]);
    expect(re2).toEqual([271, 4]);
  });
  it('Impl.listUpCodeRange', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList = Impl.listUpLineEnd(text);
    const paragraphList = Impl.listUpParagraphDelim(lineEndList);
    const codeBlockRangeList = Impl.listUpCodeBlockRange(text, lineEndList);
    const re1 = Impl.listUpCodeRange(text, paragraphList, codeBlockRangeList);
    expect(re1).toEqual([[77, 90]]);
  });
});
