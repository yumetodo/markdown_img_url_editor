import test from 'ava';
import impl from '../src/impl'
const fs = require('fs').promises;
const text1 = `arikitari
na
sekai`;
test('impl.listUpLineEnd', t => {
    const re = impl.listUpLineEnd(text1);
    t.true(3 === re.length);
    t.deepEqual(re, [9,12,18])
});
test('impl.listUpParagraphDelim', async t => {
    const text2 = await fs.readFile('./test/input/text2.md', 'utf8');
    //force LF
    const text = text2.replace(/\r\n?/g,'\n');
    const lineEndList = impl.listUpLineEnd(text);
    const re = impl.listUpParagraphDelim(lineEndList);
    t.deepEqual(re, [
        [8, 9],
        [41, 42],
        [70, 71],
        [149, 150],
        [271, 272],
        [301, 302],
        [336, 337],
        [345, 346],
        [788, 789]
    ]);
});
test('impl.listUpCodeBlockRange', async t => {
    const text2 = await fs.readFile('./test/input/text2.md', 'utf8');
    //force LF
    const text = text2.replace(/\r\n?/g,'\n');
    const lineEndList = impl.listUpLineEnd(text);
    const re = impl.listUpCodeBlockRange(text, lineEndList);
    t.deepEqual(re, [
        [43, 70],
        [151, 271],
        [303, 336]
    ]);
});
