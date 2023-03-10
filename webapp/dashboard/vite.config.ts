import { defineConfig } from "vite";
import { join } from "path";
import { generateClients } from "@innoai-tech/gents";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";
import { app, viteReact, viteChunkSplit, d2Graph } from "@innoai-tech/vite-presets";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { writeFile } from "fs/promises";

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
    viteReact(),
    viteChunkSplit({
      libRoot: [
        "../../nodepkg"
      ],
      handleModuleFederations: (moduleFederations) => {
        writeFile("node_modules/g.d2", d2Graph(moduleFederations));
      }
    }),
    nodeResolve()
  ]
});
