/*=============================================================================
  Copyright (C) 2019-2020 yumetodo <yume-wikijp@live.jp>
  https://github.com/yumetodo/markdown_img_url_editor
  Distributed under the Boost Software License, Version 1.0.
  (See https://www.boost.org/LICENSE_1_0.txt)
=============================================================================*/
// eslint-disable-next-line @typescript-eslint/naming-convention
const MarkdownImgUrlEditorBase = import('markdown_img_url_editor_rust');
type StringGeneratorType = () => string;
interface MarkdownImgUrlEditorBaseRequires {
  replace(): string;
  free(): void;
}
export class MarkdownImgUrlEditor<BaseType extends MarkdownImgUrlEditorBaseRequires> {
  private base: BaseType;
  private constructor(base: BaseType) {
    this.base = base;
  }
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  /**
   * parse markdown and find img syntax
   *
   * **DO NOT FORGET CALLING `free()`**
   *
   * We use [pulldown-cmark](https://crates.io/crates/pulldown-cmark)(rust libary) to parse.
   * @param text markdown text
   * @param converter should acccept markdown img alt and src, and return function which returns replaced string
   */
  public static async init(text: string, converter: (alt: string, src: string) => StringGeneratorType) {
    const base = await MarkdownImgUrlEditorBase;
    return new MarkdownImgUrlEditor(new base.MarkdownImgUrlEditor(text, converter));
  }
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */

  /**
   * execute function returned by converter and replace markdown img url
   *
   * Because of the rust-lang lifetime checker limitation, actually, markdown text will be parsed again.
   *
   * We use [pulldown-cmark](https://crates.io/crates/pulldown-cmark)(rust libary) to parse.
   *
   * We use [pulldown-cmark-to-cmark](https://crates.io/crates/pulldown-cmark-to-cmark)(rust libary) to replace.
   */
  public replace(): string {
    return this.base.replace();
  }
  /**
   * You must call `free()` after you use
   */
  public free(): void {
    this.base.free();
  }
}
