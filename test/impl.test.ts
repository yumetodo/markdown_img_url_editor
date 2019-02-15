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
    '92fd84ffa4de3d94d56989e4cf6b263b2419f5c5f72f5bd91ba701995643d32a'
  );
  const forVerifier = (actual: string, expected: string) => expect(actual).toEqual(expected);
  it('Impl.listUpCodeBlockByIndentRange', async () => {
    await Promise.all([text2.verify(forVerifier), text3.verify(forVerifier)]);
    const text = await Promise.all([text2.get(), text3.get()]);
    const re1 = Impl.listUpCodeBlockRangeMadeByIndent(text[0], Impl.listUpLineEnd(text[0]));
    expect(re1).toEqual([]);
    const re2 = Impl.listUpCodeBlockRangeMadeByIndent(text[1], Impl.listUpLineEnd(text[1]));
    expect(re2).toEqual([[70, 84], [117, 139], [145, 178]]);
  });
  it('Impl.listUpParagraphDelim', async () => {
    await Promise.all([text2.verify(forVerifier), text3.verify(forVerifier)]);
    const text = await Promise.all([text2.get(), text3.get()]);
    const lineEndList1 = Impl.listUpLineEnd(text[0]);
    const re1 = Impl.listUpParagraphDelim(lineEndList1, Impl.listUpCodeBlockRangeMadeByIndent(text[0], lineEndList1));
    expect(re1).toEqual([
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
    const lineEndList2 = Impl.listUpLineEnd(text[1]);
    const re2 = Impl.listUpParagraphDelim(lineEndList2, Impl.listUpCodeBlockRangeMadeByIndent(text[1], lineEndList2));
    expect(re2).toEqual([
      [25, 26],
      [34, 35],
      [65, 66],
      [68, 69],
      [85, 86],
      [101, 102],
      [115, 116],
      [140, 141],
      [143, 144],
      [179, 179],
    ]);
  });
  test('Impl.listUpCodeBlockRange', async () => {
    await Promise.all([text2.verify(forVerifier), text3.verify(forVerifier)]);
    const text = await Promise.all([text2.get(), text3.get()]);
    const re1 = Impl.listUpCodeBlockRange(text[0], Impl.listUpLineEnd(text[0]));
    expect(re1).toEqual([[43, 70], [151, 271], [303, 336]]);
    // const re2 = Impl.listUpCodeBlockRange(text[1], Impl.listUpLineEnd(text[0]));
    // expect(re2).toEqual([[0, 25], [37, 65], [303, 336]]);
  });
  it('Impl.findNearestParagraphEndPos', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList = Impl.listUpLineEnd(text);
    const codeBlockByIndentRange = Impl.listUpCodeBlockRangeMadeByIndent(text, lineEndList);
    const paragraphList = Impl.listUpParagraphDelim(lineEndList, codeBlockByIndentRange);
    const re1 = Impl.findNearestParagraphEndPos(paragraphList, 87, 0);
    expect(re1).toEqual([149, 3]);
    const re2 = Impl.findNearestParagraphEndPos(paragraphList, 176, re1[1]);
    expect(re2).toEqual([271, 4]);
  });
  it('Impl.listUpCodeRange', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList = Impl.listUpLineEnd(text);
    const codeBlockByIndentRange = Impl.listUpCodeBlockRangeMadeByIndent(text, lineEndList);
    const paragraphList = Impl.listUpParagraphDelim(lineEndList, codeBlockByIndentRange);
    const codeBlockRangeList = Impl.listUpCodeBlockRange(text, lineEndList);
    const re1 = Impl.listUpCodeRange(text, paragraphList, codeBlockRangeList);
    expect(re1).toEqual([[77, 90]]);
  });
});
