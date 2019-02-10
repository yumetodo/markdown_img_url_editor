import test from 'ava';
import impl from '../src/impl'
const text1 = `arikitari
na
sekai`;
test('listUpLineEnd', t => {
    const re = impl.listUpLineEnd(text1);
    t.true(3 === re.length);
    t.deepEqual(re, [9,12,18])
})