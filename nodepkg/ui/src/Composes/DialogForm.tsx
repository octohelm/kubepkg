import {
  DialogContainer,
  DialogContent,
  DialogHeadline,
  useDialog,
} from "../Overlays";
import { FormControl } from "../FormControls";
import { FilledButton, TextButton } from "../Buttons";

import { type FormData } from "@nodepkg/runtime";

export const useDialogForm = (
  form$: FormData<any>,
  { action }: { action: string },
) => {
  const dialog$ = useDialog(() => {
    return (
      <DialogContainer>
        <DialogHeadline>{action}</DialogHeadline>
        <DialogContent
          component={"form"}
          onSubmit={(e) => {
            e.preventDefault();
            form$.submit();
          }}
          novalidate={true}
          $action={
            <>
              <FilledButton type="submit">确定</FilledButton>
              <TextButton
                type="button"
                onClick={() => {
                  dialog$.value = false;
                }}
              >
                取消
              </TextButton>
            </>
          }
        >
          <FormControl form$={form$} />
        </DialogContent>
      </DialogContainer>
    );
  });

  return dialog$;
};
