# markdown_img_url_editor

[![NPM](https://nodei.co/npm/markdown_img_url_editor.png)](https://nodei.co/npm/markdown_img_url_editor/)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fyumetodo%2Fmarkdown_img_url_editor.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fyumetodo%2Fmarkdown_img_url_editor?ref=badge_shield)

[![CircleCI](https://circleci.com/gh/yumetodo/markdown_img_url_editor/tree/master.svg?style=svg)](https://circleci.com/gh/yumetodo/markdown_img_url_editor/tree/master) [![Greenkeeper badge](https://badges.greenkeeper.io/yumetodo/markdown_img_url_editor.svg)](https://greenkeeper.io/)

`![alt](I want to edit here!)`

```typescript
import { MarkdownImgUrlEditor } from "markdown_img_url_editor";
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

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fyumetodo%2Fmarkdown_img_url_editor.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fyumetodo%2Fmarkdown_img_url_editor?ref=badge_large)
