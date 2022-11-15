import { defineConfig } from "vite";
import { join } from "path";
import { app, presetReact } from "@innoai-tech/vite-presets";
import { generateClients } from "@innoai-tech/gents";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";

(process.env as any).APP_VERSION = "__VERSION__";

export default defineConfig({
  plugins: [
    app("dashboard"),
    injectWebAppConfig(async (c, ctx) => {
      if (ctx.env !== "$") {
        await generateClients(join(c.root!, "client"), ctx, {
          requestCreator: {
            expose: "createRequest",
            importPath: "./client",
          },
          includesRawOpenAPI: true,
        });
      }
    }),
    presetReact({
      chunkGroups: {
        core: /rollup|core-js|tslib|babel|scheduler|history|object-assign|hey-listen/,
        utils: /date-fns|lodash|rxjs|filesize|buffer|copy-to-clipboard/,
        ui: /react|react-router|emotion|mui|react-spring|innoai-tech/,
      },
    }),
  ],
});
