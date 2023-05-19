import { defineConfig, type PluginOption } from "vite";
import { app, viteChunkSplit, viteVue } from "@innoai-tech/vue-vite-presets";
import { chunkCleanup } from "@innoai-tech/monobundle";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";
import { generateClients } from "@innoai-tech/gents";
import { visualizer } from "rollup-plugin-visualizer";
import { join } from "path";

export default defineConfig({
  build: {
    assetsDir: "assets" // go embed
  },
  plugins: [
    app(process.env["APP"] ?? "dashboard"),
    injectWebAppConfig(async (c, appConfig) => {
      if (appConfig.env !== "$") {
        try {
          await generateClients(join(c.root!, "client"), appConfig, {
            requestCreator: {
              expose: "createRequest",
              importPath: "./client"
            }
          });
        } catch (e) {
          console.log(e);
        }
      }
    }),
    viteVue({}),
    viteChunkSplit({
      lib: [
        /nodepkg\/([^/]+)\/src/,
        /webapp\/([^/]+)\/mod/
      ]
    }),
    chunkCleanup(),
    process.env["VISUALIZER"] ? visualizer({
      template: "treemap", // or sunburst
      open: true,
      filename: "public/analyse.html"
    }) as PluginOption : []
  ]
});
