// vite.config.ts
import { defineConfig } from "file:///Users/morlay/src/github.com/octohelm/kubepkg/node_modules/.pnpm/vite@4.0.0/node_modules/vite/dist/node/index.js";
import { join } from "path";
import { app, presetReact } from "file:///Users/morlay/src/github.com/octohelm/kubepkg/node_modules/.pnpm/@innoai-tech+vite-presets@0.2.0_bxu7nno6h5wwo26sgk3dv42mpm/node_modules/@innoai-tech/vite-presets/index.mjs";
import { generateClients } from "file:///Users/morlay/src/github.com/octohelm/kubepkg/node_modules/.pnpm/@innoai-tech+gents@0.3.0/node_modules/@innoai-tech/gents/index.mjs";
import { injectWebAppConfig } from "file:///Users/morlay/src/github.com/octohelm/kubepkg/node_modules/.pnpm/@innoai-tech+config@0.4.13_@types+node@18.11.13/node_modules/@innoai-tech/config/vite-plugin-inject-config.mjs";
process.env.APP_VERSION = "__VERSION__";
var vite_config_default = defineConfig({
  plugins: [
    app("dashboard"),
    injectWebAppConfig(async (c, ctx) => {
      if (ctx.env !== "$") {
        await generateClients(join(c.root, "client"), ctx, {
          requestCreator: {
            expose: "createRequest",
            importPath: "./client"
          },
          includesRawOpenAPI: true
        });
      }
    }),
    presetReact({
      chunkGroups: {
        core: /rollup|core-js|tslib|babel|scheduler|history|object-assign|hey-listen/,
        utils: /date-fns|lodash|rxjs|filesize|buffer|copy-to-clipboard/,
        ui: /react|react-router|emotion|mui|react-spring|innoai-tech/
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbW9ybGF5L3NyYy9naXRodWIuY29tL29jdG9oZWxtL2t1YmVwa2cvd2ViYXBwL2Rhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21vcmxheS9zcmMvZ2l0aHViLmNvbS9vY3RvaGVsbS9rdWJlcGtnL3dlYmFwcC9kYXNoYm9hcmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21vcmxheS9zcmMvZ2l0aHViLmNvbS9vY3RvaGVsbS9rdWJlcGtnL3dlYmFwcC9kYXNoYm9hcmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBhcHAsIHByZXNldFJlYWN0IH0gZnJvbSBcIkBpbm5vYWktdGVjaC92aXRlLXByZXNldHNcIjtcbmltcG9ydCB7IGdlbmVyYXRlQ2xpZW50cyB9IGZyb20gXCJAaW5ub2FpLXRlY2gvZ2VudHNcIjtcbmltcG9ydCB7IGluamVjdFdlYkFwcENvbmZpZyB9IGZyb20gXCJAaW5ub2FpLXRlY2gvY29uZmlnL3ZpdGUtcGx1Z2luLWluamVjdC1jb25maWdcIjtcblxuKHByb2Nlc3MuZW52IGFzIGFueSkuQVBQX1ZFUlNJT04gPSBcIl9fVkVSU0lPTl9fXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBhcHAoXCJkYXNoYm9hcmRcIiksXG4gICAgaW5qZWN0V2ViQXBwQ29uZmlnKGFzeW5jIChjLCBjdHgpID0+IHtcbiAgICAgIGlmIChjdHguZW52ICE9PSBcIiRcIikge1xuICAgICAgICBhd2FpdCBnZW5lcmF0ZUNsaWVudHMoam9pbihjLnJvb3QhLCBcImNsaWVudFwiKSwgY3R4LCB7XG4gICAgICAgICAgcmVxdWVzdENyZWF0b3I6IHtcbiAgICAgICAgICAgIGV4cG9zZTogXCJjcmVhdGVSZXF1ZXN0XCIsXG4gICAgICAgICAgICBpbXBvcnRQYXRoOiBcIi4vY2xpZW50XCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIGluY2x1ZGVzUmF3T3BlbkFQSTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KSxcbiAgICBwcmVzZXRSZWFjdCh7XG4gICAgICBjaHVua0dyb3Vwczoge1xuICAgICAgICBjb3JlOiAvcm9sbHVwfGNvcmUtanN8dHNsaWJ8YmFiZWx8c2NoZWR1bGVyfGhpc3Rvcnl8b2JqZWN0LWFzc2lnbnxoZXktbGlzdGVuLyxcbiAgICAgICAgdXRpbHM6IC9kYXRlLWZuc3xsb2Rhc2h8cnhqc3xmaWxlc2l6ZXxidWZmZXJ8Y29weS10by1jbGlwYm9hcmQvLFxuICAgICAgICB1aTogL3JlYWN0fHJlYWN0LXJvdXRlcnxlbW90aW9ufG11aXxyZWFjdC1zcHJpbmd8aW5ub2FpLXRlY2gvXG4gICAgICB9XG4gICAgfSlcbiAgXVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRXLFNBQVMsb0JBQW9CO0FBQ3pZLFNBQVMsWUFBWTtBQUNyQixTQUFTLEtBQUssbUJBQW1CO0FBQ2pDLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsMEJBQTBCO0FBRWxDLFFBQVEsSUFBWSxjQUFjO0FBRW5DLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUksV0FBVztBQUFBLElBQ2YsbUJBQW1CLE9BQU8sR0FBRyxRQUFRO0FBQ25DLFVBQUksSUFBSSxRQUFRLEtBQUs7QUFDbkIsY0FBTSxnQkFBZ0IsS0FBSyxFQUFFLE1BQU8sUUFBUSxHQUFHLEtBQUs7QUFBQSxVQUNsRCxnQkFBZ0I7QUFBQSxZQUNkLFFBQVE7QUFBQSxZQUNSLFlBQVk7QUFBQSxVQUNkO0FBQUEsVUFDQSxvQkFBb0I7QUFBQSxRQUN0QixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLE1BQ1YsYUFBYTtBQUFBLFFBQ1gsTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFFBQ1AsSUFBSTtBQUFBLE1BQ047QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
