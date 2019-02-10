import test from 'ava';
import impl from '../src/impl'
const text1 = `arikitari
na
sekai`;
test('impl.listUpLineEnd', t => {
    const re = impl.listUpLineEnd(text1);
    t.true(3 === re.length);
    t.deepEqual(re, [9,12,18])
});
/* eslint-disable max-len */
const text2 = `# [![AVA](media/header.png)](https://ava.li)

[![Build Status](https://travis-ci.org/avajs/ava.svg?branch=master)](https://travis-ci.org/avajs/ava)  [![Coverage Status](https://codecov.io/gh/avajs/ava/branch/master/graph/badge.svg)](https://codecov.io/gh/avajs/ava/branch/master) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/ava)
[![Mentioned in Awesome Node.js](https://awesome.re/mentioned-badge.svg)](https://github.com/sindresorhus/awesome-nodejs)

Testing can be a drag. AVA helps you get it done. AVA is a test runner for Node.js with a concise API, detailed error output, embrace of new language features and process isolation that let you write tests more effectively. So you can ship more awesome code. 🚀

Follow the [AVA Twitter account](https://twitter.com/ava__js) for updates.`
/* eslint-enable max-len */
test('impl.listUpParagraphDelim', t => {
    const text = text2.replace(/\r\n?/g,'\n');
    const lineEndList = impl.listUpLineEnd(text);
    const re = impl.listUpParagraphDelim(lineEndList);
    t.true(4 === re.length);
    t.deepEqual(re, [[44,45],[614,615], [877, 878], [953, 953]]);
});
