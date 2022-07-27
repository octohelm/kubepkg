import { defineConfig } from "vite";
import { join } from "path";
import { app, presetReact } from "@innoai-tech/vite-presets";
import { generateClients } from "@innoai-tech/gents";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";

export default defineConfig({
  plugins: [
    app("dashboard"),
    injectWebAppConfig(async (c, ctx) => {
      if (ctx.env !== "$") {
        await generateClients(join(c.root!, "client"), ctx, {
          expose: "createRequest",
          importPath: "./client",
        });
      }
    }),
    presetReact({
      chunkGroups: {
        core: /rollup|core-js|tslib|babel|scheduler|history|object-assign|hey-listen|react|react-router/,
        utils: /innoai-tech|date-fns|lodash|rxjs|filesize|buffer/,
        styling: /emotion|react-spring|mui/,
      },
    }),
  ],
});
