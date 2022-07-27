import { AppConfig, AppContext, api, confLoader } from "@innoai-tech/config";

const APP_CONFIG = {
  API_AGENT: api({
    openapi: "/api/kubepkg-agent",
  })(({ env }: AppContext) => {
    if (env === "local") {
      return "http://0.0.0.0:36060";
    }
    return "";
  }),
};

export const CONFIG: AppConfig = {
  name: "kubepkg-agent",
  group: "",
  manifest: {
    crossorigin: "use-credentials",
  },
  config: APP_CONFIG,
};

export default confLoader<keyof typeof APP_CONFIG>();
