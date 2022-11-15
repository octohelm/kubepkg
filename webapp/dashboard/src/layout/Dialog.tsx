import { useProxy } from "./state";
import { FormControls } from "./FormControl";
import { Subscribe, useStateSubject } from "@innoai-tech/reactutil";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SxProps,
} from "@mui/material";
import type { FormSubject } from "@innoai-tech/form";
import type { ReactNode } from "react";
import { noop } from "@innoai-tech/lodash";
import type { Theme } from "@mui/system";

export interface DialogProps {
  title: string;
  action?: string | undefined;
  content?: ReactNode;
  onConfirm?: () => void;
  sx?: SxProps<Theme>;
}

export const useDialog = ({
  title,
  content,
  action = "确定",
  sx = { "& .MuiDialog-paper": { width: "80%" } },
  onConfirm = noop,
}: DialogProps) => {
  const dialog$ = useStateSubject(false);

  return useProxy(dialog$, {
    title: title,
    render: () => (
      <Subscribe value$={dialog$}>
        {(open) => {
          return (
            <Dialog sx={sx} open={open} onClose={() => dialog$.next((v) => !v)}>
              <Box
                component="form"
                sx={{
                  "& .MuiFormControl-root": { mb: 2 },
                }}
                autoComplete="off"
                noValidate={true}
                onSubmit={(e: any) => {
                  e.preventDefault();
                  onConfirm();
                }}
              >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>{content}</DialogContent>
                <DialogActions>
                  <Button onClick={() => dialog$.next(false)}>取消</Button>
                  <Button type="submit">{action}</Button>
                </DialogActions>
              </Box>
            </Dialog>
          );
        }}
      </Subscribe>
    ),
  });
};

export const useDialogForm = <T extends object>(
  form$: FormSubject<T>,
  { title, action }: Pick<DialogProps, "title" | "action">
) => {
  return useDialog({
    title,
    action,
    content: <FormControls form$={form$} />,
    onConfirm: () => {
      form$.submit();
    },
  });
};
