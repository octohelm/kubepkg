import { AuthProviderCallback } from "@webapp/dashboard/mod/auth";
import { component } from "@nodepkg/runtime"

export default component(() => {
  return () => {
    return <AuthProviderCallback />;
  }
})