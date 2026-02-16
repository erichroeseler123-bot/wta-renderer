import { marked } from "marked";

marked.setOptions({
  mangle: false,
  headerIds: true,
});

export function mdToHtml(markdown) {
  return marked.parse(markdown);
}
