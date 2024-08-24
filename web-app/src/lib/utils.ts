import { Marked } from "marked";
import type { Renderer, Token } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import GithubSlugger from "github-slugger";

export const sortOptions = [
  { value: "creation-time", text: "Creation time" },
  { value: "last-modified", text: "Last modified" },
  { value: "title-a-to-z", text: "Title - A to Z" },
  { value: "title-z-to-a", text: "Title - Z to A" }
];

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];

const createMarkdownParser = (showToc = true) => {
  const marked = new Marked();

  marked.use({
    async: false,
    pedantic: false,
    gfm: true
  });

  marked.use(
    markedHighlight({
      async: false,
      langPrefix: "language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;

  function unescape(html: string) {
    return html.replace(unescapeTest, (_, n) => {
      n = n.toLowerCase();
      if (n === "colon") return ":";
      if (n.charAt(0) === "#") {
        return n.charAt(1) === "x"
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return "";
    });
  }

  let slugger = new GithubSlugger();
  let headings: { text: string; raw: string; level: number; id: string }[] = [];
  let sectionStack: { level: number; id: string }[] = [];

  function gfmHeadingId({ prefix = "", showToc = true } = {}) {
    return {
      renderer: {
        heading(this: Renderer, { tokens, depth }: { tokens: Token[]; depth: number }) {
          const text = this.parser.parseInline(tokens);
          const raw = unescape(this.parser.parseInline(tokens, this.parser.textRenderer))
            .trim()
            .replace(/<[!\/a-z].*?>/gi, "");
          const level = depth;
          const id = `${prefix}${slugger.slug(raw.toLowerCase())}`;
          const heading = { level, text, id, raw };
          headings.push(heading);

          let closingSections = "";
          while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
            sectionStack.pop();
            closingSections += "</section>";
          }

          sectionStack.push({ level, id });
          const openingSection = `<section id="${id}">`;

          return `
            ${closingSections}
            ${openingSection}
            <h${level}>
              <a href="#${id}">${text}</a>
            </h${level}>
          `;
        }
      },
      hooks: {
        preprocess(src: string) {
          headings = [];
          sectionStack = [];
          slugger = new GithubSlugger();

          return src;
        },
        postprocess(html: string) {
          const closingRemainingSection = "</section>".repeat(sectionStack.length);

          const tableOfContents =
            showToc && headings.length > 0
              ? `<details class="table-of-contents">
                <summary>Table of contents</summary>
                <ul>
                  ${headings
                    .map(
                      ({ id, text, level }) => `
                      <li><a href="#${id}" class="h${level}">${text}</a></li>`
                    )
                    .join("")}
                </ul>
              </details>`
              : "";

          return `
            ${tableOfContents}
            ${html}
            ${closingRemainingSection}
          `;
        }
      }
    };
  }

  marked.use(gfmHeadingId({ showToc: showToc }));

  return marked;
};

export const md = (markdownContent: string, showToc = true) => {
  const marked = createMarkdownParser(showToc);
  const html = marked.parse(markdownContent);

  return html as string;
};

export const handleImagePaste = async (event: ClipboardEvent, API_BASE_PREFIX: string) => {
  const clipboardItems = Array.from(event.clipboardData?.items || []);
  const file = clipboardItems.find((item) => item.type.startsWith("image/"));

  if (!file) return null;

  event.preventDefault();

  const fileObject = file.getAsFile();

  if (!fileObject) return;

  const formData = new FormData();
  formData.append("file", fileObject);

  const request = await fetch("?/pasteImage", {
    method: "POST",
    body: formData
  });

  const response = await request.json();
  const fileId = JSON.parse(response.data)[1];
  const fileUrl = `${API_BASE_PREFIX}/rpc/retrieve_file?id=${fileId}`;

  const target = event.target as HTMLTextAreaElement;
  const newContent =
    target.value.slice(0, target.selectionStart) +
    `![](${fileUrl})` +
    target.value.slice(target.selectionStart);

  return newContent;
};
