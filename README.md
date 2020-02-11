# markdown_img_url_editor

[![NPM](https://nodei.co/npm/markdown_img_url_editor.png)](https://nodei.co/npm/markdown_img_url_editor/)

[![CircleCI](https://circleci.com/gh/yumetodo/markdown_img_url_editor/tree/master.svg?style=svg)](https://circleci.com/gh/yumetodo/markdown_img_url_editor/tree/master) [![Greenkeeper badge](https://badges.greenkeeper.io/yumetodo/markdown_img_url_editor.svg)](https://greenkeeper.io/)

`![alt](I want to edit here!)`

```typescript
import { MarkdownImgUrlEditor } from 'markdown_img_url_editor';
const markdownText = `hoge
![img](/path/to/file)
fuga`;
    const markdownImgUrlEditor = await MarkdownImgUrlEditor.init(await text2.get(), (a, s) => {
      //a: img
      //s: /path/to/file
      return () => s;
    });
    // do something
    const replaced = markdownImgUrlEditor.replace();
```

We use [pulldown-cmark](https://crates.io/crates/pulldown-cmark)(rust libary) to parse.

We use [pulldown-cmark-to-cmark](https://crates.io/crates/pulldown-cmark-to-cmark)(rust libary) to replace.

## Known Issue

Because of [pulldown-cmark-to-cmark](https://crates.io/crates/pulldown-cmark-to-cmark) limitation, all code block will be replaced like below:

`before`:

    ```typescript
    console.log("arikitari na sekai");
    ```

`after`:

    ````typescript
    console.log("arikitari na sekai");
    ````

Almost all cases, that is no problem because HTML converted result will be equal.

However, in some cases, the replaced result will be broken.

`before`:

``````markdown
`````markdown
````markdown
```typescript
console.log("arikitari na sekai");
```
````
`````
``````

`after`:

    ````markdown
    ````markdown
    ```typescript
    console.log("arikitari na sekai");
    ```
    ````
    ````

