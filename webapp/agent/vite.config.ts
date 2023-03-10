import { defineConfig } from "vite";
import { app, d2Graph, viteChunkSplit, viteReact } from "@innoai-tech/vite-presets";
import { generateClients } from "@innoai-tech/gents";
import { join } from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { writeFile } from "fs/promises";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";

export default defineConfig({
  plugins: [
    app("agent", {
      enableBaseHref: true
    }),
    injectWebAppConfig(async (c, ctx) => {
      if (ctx.env !== "$") {
        await generateClients(join(c.root!, "client"), ctx, {
          requestCreator: {
            importPath: "./client",
            expose: "createRequest"
          }
        });
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
