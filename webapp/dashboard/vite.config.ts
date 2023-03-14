import { defineConfig } from "vite";
import { join } from "path";
import { generateClients } from "@innoai-tech/gents";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";
import { app, viteReact, viteChunkSplit, d2Graph } from "@innoai-tech/vite-presets";
import { writeFile } from "fs/promises";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  resolve: {
    dedupe: [
      "@mui/system",
      "@mui/material"
    ]
  },
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
    viteReact({
      plugins: [
        ["@innoai-tech/swc-plugin-annotate-pure-calls", {}]
      ]
    }),
    viteChunkSplit({
      libRoot: [
        "../../nodepkg"
      ],
      handleModuleFederations: (moduleFederations) => {
        writeFile("node_modules/g.d2", d2Graph(moduleFederations));
      }
    }),
    visualizer({
      filename: "stats.html"
    })
  ]
});
