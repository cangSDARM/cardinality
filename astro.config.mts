import { defineConfig } from "astro/config";
import DropParagraph from "@allenlee/remark-drop-paragraph";
import { visit, SKIP } from "unist-util-visit";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { unified, rehypeHeadingIds } from "@astrojs/markdown-remark";

import tailwindcss from "@tailwindcss/vite";

import vue from "@astrojs/vue";

const mdLayout = () => {
  // @ts-ignore
  return function (_, file) {
    file.data.astro.frontmatter.layout ||= "@/components/Layout.astro";
  };
};

const mdImageFlow = () => {
  function isImageNode(node: any) {
    const img = node;

    return img.type === "element" && img.tagName === "img" && img.properties && typeof img.properties.src === "string";
  }

  // @ts-ignore
  return function (root) {
    visit(root, (node, i, p) => {
      if (isImageNode(node)) {
        p.children.splice(i, 1, {
          type: "element",
          tagName: "figure",
          properties: {
            className: "figure",
          },
          children: [node],
        });

        return SKIP;
      }
    });

    return root;
  };
};

// https://astro.build/config
export default defineConfig({
  site: "https://cangSDARM.github.io",
  base: "cardinality",

  markdown: {
    processor: unified({
      remarkPlugins: [mdLayout, remarkMath],
      rehypePlugins: [
        rehypeHeadingIds,
        mdImageFlow,
        rehypeKatex,
        // @ts-ignore
        DropParagraph,
      ],
      remarkRehype: {
        footnoteBackContent: (_: any, referenceIndex: number) => {
          return [
            {
              type: "element",
              tagName: "sup",
              properties: {},
              children: [{ type: "text", value: "[return]" }],
            },
          ];
        },
      },
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [vue({ appEntrypoint: "./src/pages/_app" })],
});
