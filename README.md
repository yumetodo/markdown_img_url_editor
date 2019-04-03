# markdown_img_url_editor

[![NPM](https://nodei.co/npm/markdown_img_url_editor.png)](https://nodei.co/npm/markdown_img_url_editor/)

[![Build Status](https://travis-ci.org/yumetodo/markdown_img_url_editor.svg?branch=master)](https://travis-ci.org/yumetodo/markdown_img_url_editor) [![Greenkeeper badge](https://badges.greenkeeper.io/yumetodo/markdown_img_url_editor.svg)](https://greenkeeper.io/)

`![alt](I want to edit here!)`

```typescript
import { markdownImgUrlEditor } from 'markdown_img_url_editor';
const markdownText = `hoge
![img](/path/to/file)
fuga`;
    const replaced = await markdownImgUrlEditor(
      markdownText,
      s => {
        return () => s;
      },
      async () => {
        //executed before await 2nd arg results
      }
    );
```
