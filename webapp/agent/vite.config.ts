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
          expose: "createRequest",
          importPath: "./client",
        });
      }
    }),
    presetReact({
      chunkGroups: {
        core: /babel|core-js|tslib|scheduler|history|object-assign|hey-listen|react|react-router/,
        utils: /innoai-tech|date-fns|lodash|rxjs|filesize|buffer/,
        styling: /emotion|react-spring|mui/,
      },
    }),
  ],
});
