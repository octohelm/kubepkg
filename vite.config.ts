import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { injectWebAppConfig } from "@innoai-tech/config/vite-plugin-inject-config";
import nodeResolve from "@rollup/plugin-node-resolve";
import { join } from "path";
import { vendorChunks } from "./nodepkg/tool/vendor-chunks";

const cwd = process.cwd();

const appName = process.env.APP || "agent"

const outDir = join(cwd, `internal/${appName}`, "dist");

console.log(`bundling to ${outDir}`);

export default defineConfig({
  root: `./webapp/${appName}`,
  build: {
    outDir,
    emptyOutDir: true
  },
  resolve: {
    dedupe: ["react", "react-dom", "@emotion/react"]
  },
  plugins: [
    vendorChunks({
      core: /babel|core-js|tslib|scheduler|history|object-assign|hey-listen|react|react-router/,
      utils: /innoai-tech|date-fns|lodash|rxjs|filesize|buffer/,
      styling: /emotion|react-spring|mui/
    }),
    injectWebAppConfig() as any,
    nodeResolve({
      mainFields: ["browser", "jsnext:main", "module", "main"],
      moduleDirectories: [
        cwd, // project root for mono repo
        join(cwd, "node_modules"), // root node_modules first
        "node_modules" // then related node_modules
      ],
      extensions: [".ts", ".tsx", ".mjs", ".js", ".jsx"]
    }),
    viteReact({
      jsxRuntime: "automatic",
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      },
      jsxPure: true
    })
  ]
});
