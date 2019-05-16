import { Impl } from '../src/impl';
import TextCache from 'verifiable-file-read-all-cache';
import deepFreeze from 'deep-freeze';
const text1 = `arikitari
na
sekai`;
const text6 = `~~~
~~~ ggg
~~~
`;
describe('impl', () => {
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
    '4d88c8cd6ce398bab08132caf377f5b6ddcde6e0d22e5416f0f98273a3bbc08d'
  );
  const text4 = new TextCache(
    './test/input/text4.md',
    '6018d975487d3e80fb481c654dfd88ee11667ca0404032e6de6bb9860c9ec78d'
  );
  const text5 = new TextCache(
    './test/input/text5.md',
    '42c2670609945557ad777c3b5db8618fca99557f92ed8b3ff4962a7771689d1c'
  );
  const forVerifier = (actual: string, expected: string) => expect(actual).toEqual(expected);
  it('Impl.listUpParagraphDelim', async () => {
    await Promise.all([text2.verify(forVerifier), text3.verify(forVerifier), text4.verify(forVerifier)]);
    const text = await Promise.all([text2.get(), text3.get(), text4.get()]);
    const lineEndList1 = Impl.listUpLineEnd(text[0]);
    const re1 = Impl.listUpParagraphDelim(
      lineEndList1,
      Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
        text[0],
        lineEndList1,
        Impl.listUpCodeBlockRange(text[0], lineEndList1)
      )
    );
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
    const re2 = Impl.listUpParagraphDelim(
      lineEndList2,
      Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
        text[1],
        lineEndList2,
        Impl.listUpCodeBlockRange(text[1], lineEndList2)
      )
    );
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
      [214, 214],
      [222, 222],
    ]);
    const lineEndList3 = Impl.listUpLineEnd(text[2]);
    const re3 = Impl.listUpParagraphDelim(
      lineEndList3,
      Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
        text[2],
        lineEndList3,
        Impl.listUpCodeBlockRange(text[2], lineEndList3)
      )
    );
    expect(re3).toEqual([[11, 12], [24, 25], [53, 54], [89, 90], [125, 126], [140, 141]]);
  });
  test('Impl.listUpCodeBlockRange', async () => {
    await Promise.all([text2.verify(forVerifier), text3.verify(forVerifier), text5.verify(forVerifier)]);
    const text = await Promise.all([text2.get(), text3.get(), text5.get(), text6]);
    const lineEndList1 = Impl.listUpLineEnd(text[0]);
    const re1 = Impl.listUpCodeBlockRange(text[0], lineEndList1);
    expect(re1).toEqual([[43, 69], [151, 270], [303, 335]]);
    const re2 = Impl.listUpCodeBlockRange(text[1], Impl.listUpLineEnd(text[1]));
    expect(re2).toEqual([[0, 18], [36, 64], [180, 213]]);
    const re3 = Impl.listUpCodeBlockRange(text[2], Impl.listUpLineEnd(text[2]));
    expect(re3).toEqual([
      [0, 11],
      [14, 28],
      [31, 45],
      [48, 66],
      [69, 85],
      [88, 94],
      [97, 109],
      [112, 127],
      [130, 144],
      [147, 168],
    ]);
    const re4 = Impl.listUpCodeBlockRange(text[3], Impl.listUpLineEnd(text[3]));
    expect(re4).toEqual([[0, 14]]);
  });
  it('Impl.listUpCodeBlockRangeMadeByIndentAndMerge', async () => {
    await Promise.all([text2.verify(forVerifier), text3.verify(forVerifier)]);
    const text = await Promise.all([text2.get(), text3.get()]);
    const lineEndList1 = Impl.listUpLineEnd(text[0]);
    const beforeMerge: ReadonlyArray<ReadonlyArray<number>> = deepFreeze(
      Impl.listUpCodeBlockRange(text[0], lineEndList1)
    );
    const beforeMergeLen = beforeMerge.length;
    const re1 = Impl.listUpCodeBlockRangeMadeByIndentAndMerge(text[0], lineEndList1, beforeMerge);
    expect(re1.length).toEqual(beforeMergeLen);
    expect(re1).toEqual(beforeMerge);
    const lineEndList2 = Impl.listUpLineEnd(text[1]);
    const re2 = Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
      text[1],
      lineEndList2,
      deepFreeze(Impl.listUpCodeBlockRange(text[1], lineEndList2))
    );
    expect(re2).toEqual([[0, 18], [36, 64], [70, 84], [117, 139], [145, 178], [180, 213], [215, 221]]);
  });
  it('Impl.findNearestParagraphEndPos', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList1 = Impl.listUpLineEnd(text);
    const codeBlockByIndentRange = Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
      text,
      lineEndList1,
      Impl.listUpCodeBlockRange(text, lineEndList1)
    );
    const paragraphList = Impl.listUpParagraphDelim(lineEndList1, codeBlockByIndentRange);
    const re1 = Impl.findNearestParagraphEndPos(paragraphList, 87, 0);
    expect(re1).toEqual([149, 3]);
    const re2 = Impl.findNearestParagraphEndPos(paragraphList, 176, re1[1]);
    expect(re2).toEqual([271, 4]);
  });
  it('Impl.listUpCodeRange', async () => {
    await text2.verify(forVerifier);
    const text = await text2.get();
    const lineEndList1 = Impl.listUpLineEnd(text);
    const codeBlockByIndentRange = Impl.listUpCodeBlockRangeMadeByIndentAndMerge(
      text,
      lineEndList1,
      Impl.listUpCodeBlockRange(text, lineEndList1)
    );
    const paragraphList = Impl.listUpParagraphDelim(lineEndList1, codeBlockByIndentRange);
    const codeBlockRangeList = Impl.listUpCodeBlockRange(text, lineEndList1);
    const re1 = Impl.listUpCodeRange(text, paragraphList, codeBlockRangeList);
    expect(re1).toEqual([[77, 90]]);
  });
});
