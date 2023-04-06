import { createApp } from "@nodepkg/runtime";
import { App } from "./App";
import { createRouter, createWebHistory } from "@innoai-tech/vuekit";

// from vite plugin
// @ts-ignore
import routes from "~pages";

console.log(routes);

const base = new URL(document.querySelector("base")?.href ?? "/");

const router = createRouter({
  history: createWebHistory(base.pathname),
  routes
});

createApp(App).use(router).mount("#root");
