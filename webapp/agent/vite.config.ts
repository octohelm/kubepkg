import { defineConfig } from "vite";
import { app, presetReact } from "@innoai-tech/vite-presets";
import { generateClients } from "@innoai-tech/gents";
import { join } from "path";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";

export default defineConfig({
  plugins: [
    app("agent", {
      enableBaseHref: true,
    }),
    injectWebAppConfig(async (c, ctx) => {
      if (ctx.env !== "$") {
        await generateClients(join(c.root!, "client"), ctx, {
          requestCreator: {
            importPath: "./client",
            expose: "createRequest",
          },
        });
      }
    }),
    presetReact({
      chunkGroups: {
        utils: [
          "date-fns",
          "rxjs",
          "filesize",
          "lodash",
          "lodash-es",
          "@innoai-tech/lodash",
        ],
        uikit: [
          "react",
          "hey-listen",
          "history",
          "react-router",
          "react-spring",
          "@innoai-tech/*",
        ],
        ui: ["@emotion/*", "@mui/*"],
      },
    }),
  ],
});
