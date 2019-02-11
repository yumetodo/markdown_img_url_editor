import test from 'ava';
import impl from '../src/impl';
const TextCache = require('verifiable-file-read-all-cache');
const text1 = `arikitari
na
sekai`;
test('impl.listUpLineEnd', t => {
  const re = impl.listUpLineEnd(text1);
  t.true(3 === re.length);
  t.deepEqual(re, [9, 12, 18]);
});
const text2 = new TextCache(
  './test/input/text2.md',
  'd270ba28b95e9f256ca2eb993fc0692b9d755c4b397f75ea2d5deb5cf39c49f1'
);
test('impl.listUpParagraphDelim', async t => {
  await text2.verify((actual, expected) => t.true(actual === expected));
  const text = await text2.get();
  const lineEndList = impl.listUpLineEnd(text);
  const re = impl.listUpParagraphDelim(lineEndList);
  t.deepEqual(re, [[8, 9], [41, 42], [70, 71], [149, 150], [271, 272], [301, 302], [336, 337], [345, 346], [788, 789]]);
});
test('impl.listUpCodeBlockRange', async t => {
  await text2.verify((actual, expected) => t.true(actual === expected));
  const text = await text2.get();
  const lineEndList = impl.listUpLineEnd(text);
  const re = impl.listUpCodeBlockRange(text, lineEndList);
  t.deepEqual(re, [[43, 70], [151, 271], [303, 336]]);
});
test('impl.findNearestParagraphEndPos', async t => {
  await text2.verify((actual, expected) => t.true(actual === expected));
  const text = await text2.get();
  const lineEndList = impl.listUpLineEnd(text);
  const paragraphList = impl.listUpParagraphDelim(lineEndList);
  const re1 = impl.findNearestParagraphEndPos(paragraphList, 87, 0);
  t.deepEqual(re1, [149, 3]);
  const re2 = impl.findNearestParagraphEndPos(paragraphList, 176, re1[1]);
  t.deepEqual(re2, [271, 4]);
});
