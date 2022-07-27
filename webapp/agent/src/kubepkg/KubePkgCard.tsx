import type { KubepkgV1Alpha1KubePkg } from "../client/agent";
import { isObject, map } from "@innoai-tech/lodash";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Box, useTheme } from "@mui/system";
import { Subscribe, useStateSubject } from "@innoai-tech/reactutil";

export interface KubeManifest {
  apiVersion: string;
  kind: string;
  metadata?: {
    name: string;
    namespace: string;
    labels: { [k: string]: string };
  };
  status?: any;
}

const isKubeManifest = (m: any): m is KubeManifest => {
  return m.apiVersion && m.kind;
};

const flattenKubePkg = (
  kubepkg: KubepkgV1Alpha1KubePkg
): {
  [k: string]: KubeManifest;
} => {
  const flattenManifests: { [k: string]: KubeManifest } = {};

  const walk = (
    manifests: {
      [k: string]: KubeManifest | { [k: string]: KubeManifest };
    } = {},
    parent = ""
  ) => {
    for (const n in manifests) {
      const m = manifests[n];
      if (isObject(m)) {
        const key = parent ? `${parent}.${n}` : n;

        if (isKubeManifest(m)) {
          flattenManifests[key] = {
            ...m,
            status: (kubepkg.status?.statuses || {})[key],
          };
        } else {
          walk(m as any, key);
        }
      }
    }
  };

  walk(kubepkg.spec.manifests, "");

  return flattenManifests;
};

export const KubePkgManifestStatus = ({
  manifest,
}: {
  manifest: KubeManifest;
}) => {
  const theme = useTheme();

  if (manifest.status?.conditions) {
    return (
      <Stack component="span" flexDirection={"row"} gap={0.5}>
        {map(manifest.status?.conditions, (c, i) => {
          const color =
            c.status === "True"
              ? theme.palette["success"]
              : theme.palette["error"];

          return (
            <Box
              key={i}
              component="span"
              sx={{
                pl: 0.5,
                pr: 0.5,
                borderRadius: 1,
                fontSize: 11,
                color: color.contrastText,
                backgroundColor: color[theme.palette.mode],
              }}
            >
              {c.type}
            </Box>
          );
        })}
      </Stack>
    );
  }

  return null;
};

export const KubePkgManifest = ({ manifest }: { manifest: KubeManifest }) => {
  const detailOpen$ = useStateSubject(() => false);

  return (
    <Box>
      <Typography sx={{ fontSize: 9, lineHeight: 1 }} color="text.secondary">
        {manifest.kind}.{manifest.apiVersion}
      </Typography>
      <Typography color="text.primary">
        <Box
          component="span"
          sx={{ display: "flex", alignItems: "center" }}
          onClick={() => detailOpen$.next(true)}
        >
          <Box component="span" sx={{ flex: 1 }}>
            {manifest.metadata?.name}
          </Box>
          <Box component="span">
            <KubePkgManifestStatus manifest={manifest} />
          </Box>
        </Box>
        <Subscribe value$={detailOpen$}>
          {(open) => {
            return (
              <Dialog
                open={open}
                onClose={() => detailOpen$.next(false)}
                scroll={"body"}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
              >
                <DialogTitle sx={{ display: "flex" }}>
                  {manifest.metadata?.name}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText tabIndex={-1}>
                    <Typography variant={"caption"}>
                      <pre>
                        <code>{`${JSON.stringify(manifest, null, 2)}`}</code>
                      </pre>
                    </Typography>
                  </DialogContentText>
                </DialogContent>
              </Dialog>
            );
          }}
        </Subscribe>
      </Typography>
      {manifest.status.$apply && (
        <Typography sx={{ fontSize: 11, lineHeight: 1 }} color="error">
          {manifest.status.$apply}
        </Typography>
      )}
    </Box>
  );
};

export const KubePkgCard = ({
  kubepkg,
}: {
  kubepkg: KubepkgV1Alpha1KubePkg;
}) => {
  const manifests = useMemo(() => flattenKubePkg(kubepkg), [kubepkg]);

  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader
        subheader={
          <Typography variant="h4" sx={{ fontSize: 16 }}>
            {`${kubepkg.metadata?.name}.${kubepkg.metadata?.namespace}`}
          </Typography>
        }
      />
      <CardContent>
        <Stack gap={1}>
          {map(manifests, (m, key) => (
            <KubePkgManifest key={key} manifest={m} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
