import { MarkdownImgUrlEditor as Base } from '../markdown_img_url_editor_rust/pkg/markdown_img_url_editor_rust';
const MarkdownImgUrlEditorBase = import('../markdown_img_url_editor_rust/pkg/markdown_img_url_editor_rust');
type stringGeneratorType = () => string;
export class MarkdownImgUrlEditor {
  private base: Base;
  private constructor(base: Base) {
    this.base = base;
  }
  /**
   * parse markdown and find img syntax
   *
   * **DO NOT FORGET CALLING `free()`**
   *
   * We use [pulldown-cmark](https://crates.io/crates/pulldown-cmark)(rust libary) to parse.
   * @param text markdown text
   * @param converter should acccept markdown img alt and src, and return function which returns replaced string
   */
  public static async init(
    text: string,
    converter: (alt: string, src: string) => stringGeneratorType
  ): Promise<MarkdownImgUrlEditor> {
    const base = await MarkdownImgUrlEditorBase;
    return new MarkdownImgUrlEditor(new base.MarkdownImgUrlEditor(text, converter));
  }
  /**
   * execute function returned by converter and replace markdown img url
   *
   * Because of the rust-lang lifetime checker limitation, actually, markdown text will be parsed again.
   *
   * We use [pulldown-cmark](https://crates.io/crates/pulldown-cmark)(rust libary) to parse.
   *
   * We use [pulldown-cmark-to-cmark](https://crates.io/crates/pulldown-cmark-to-cmark)(rust libary) to parse.
   */
  public replace(): string {
    return this.base.replace();
  }
  /**
   * You must call `free()` after you use
   */
  public free() {
    this.base.free();
  }
}
