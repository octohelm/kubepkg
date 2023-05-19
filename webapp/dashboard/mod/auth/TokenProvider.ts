import { ManifestProvider, persist } from "@nodepkg/runtime";
import { createProvider, ext } from "@innoai-tech/vuekit";
import { BehaviorSubject } from "@nodepkg/runtime/rxjs";

export interface Token {
  id: string;
  type: string;
  accessToken: string;
  refreshToken: string;
}

const expiresIn = (tokenStr?: string) => {
  if (tokenStr) {
    try {
      return (
        (JSON.parse(atob(tokenStr.split(".")[1]!)).exp - 30) * 1000 - Date.now()
      );
    } catch (_) {
    }
  }
  return 0;
};

const validateToken = (tokenStr?: string) => {
  return expiresIn(tokenStr) > 0;
};

export const TokenProvider = createProvider(() => {
  const manifest = ManifestProvider.use();

  const token$ = persist(
    `${manifest.name}/token`,
    (v: Token | null) => new BehaviorSubject<Token | null>(v)
  );

  return ext(token$, {
    validateToken,
    expiresIn,
    logout: () => token$.next(null)
  });
}, {
  name: "Token"
});
