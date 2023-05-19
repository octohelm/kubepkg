import { createProvider } from "@innoai-tech/vuekit";

export interface Index {
  name: string;
  description?: string;
}

export const ManifestProvider = createProvider<Index>(
  () => ({
    name: "undefined",
  }),
  {
    name: "Manifest",
  }
);
