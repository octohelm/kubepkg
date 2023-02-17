import { AppConfig, AppContext, api, confLoader } from "@innoai-tech/config";

const APP_CONFIG = {
  API_DASHBOARD: api({
    openapi: "/api/kubepkg-dashboard",
  })(({ env }: AppContext) => {
    if (env === "local") {
      return "http://0.0.0.0:8081";
    }
    return "";
  }),
};

export const CONFIG: AppConfig = {
  name: "kubepkg-dashboard",
  group: "",
  manifest: {
    crossorigin: "use-credentials",
  },
  config: APP_CONFIG,
};

export default confLoader<keyof typeof APP_CONFIG>();
