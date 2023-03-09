import { useParams } from "@nodepkg/router";
import { KubepkgVersionPreview } from "src/kubepkg";
import { GroupKubePkgVersionProvider } from "src/kubepkg/domain";
import { Scaffold } from "src/app/layout";


export default (() => {
  const params = useParams<{ group: string; name: string }>();

  return (
    <GroupKubePkgVersionProvider
      groupName={params.group!}
      kubePkgName={params.name!}
    >
      <Scaffold>
        <KubepkgVersionPreview />
      </Scaffold>
    </GroupKubePkgVersionProvider>
  );
});
