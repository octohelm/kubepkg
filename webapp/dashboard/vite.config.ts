import { defineConfig } from "vite";
import { join } from "path";
import { app, presetReact } from "@innoai-tech/vite-presets";
import { generateClients } from "@innoai-tech/gents";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";
import pages, { reactResolver } from "vite-plugin-pages";
import { stringify } from "./src/app/settings";

(process.env as any).APP_VERSION = "__VERSION__";

// @ts-ignore
export default defineConfig({
  plugins: [
    app("dashboard"),
    injectWebAppConfig(async (c, ctx) => {
      if (ctx.env !== "$") {
        try {
          await generateClients(join(c.root!, "client"), ctx, {
            requestCreator: {
              expose: "createRequest",
              importPath: "./client"
            },
            includesRawOpenAPI: true
          });
        } catch (e) {
          console.log(e);
        }
      }
    }),
    pages({
      pagesDir: "./app/routes",
      resolver: {
        ...reactResolver(),
        stringify: stringify
      }
    }),
    presetReact({
      chunkGroups: {
        utils: [
          "@innoai-tech/lodash",
          "rxjs",
          "date-fns",
          "filesize",
          "copy-to-clipboard"
        ],
        uikit: [
          "react",
          "react-dom",
          "react-router",
          "react-router-dom",
          "react-spring",
          "@innoai-tech/*"
        ],
        ui: ["@emotion/*", "@mui/*", "@monaco-editor/*"],
        codemirror: ["@codemirror/*", "@lezer/*", "ajv"],
        markdown: ["unified", "rehype-*", "remark-*"]
      }
    })
    // visualizer({
    //   emitFile: true,
    //   filename: "stats.html"
    // })
  ]
});
