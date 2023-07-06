import {
  styled,
  Overlay,
  transition,
  variant,
  alpha,
  defineTransition,
} from "@innoai-tech/vueuikit";
import {
  component,
  t,
  observableRef,
  type ObservableRef,
  ext,
  rx,
  render,
} from "@nodepkg/runtime";
import { watch, ref, type VNodeChild } from "vue";
import { FilledButton, TextButton } from "../Buttons";

export const useDialog = (
  r: (dialog$: ObservableRef<boolean>) => JSX.Element,
) => {
  const isOpen$ = observableRef(false);

  return ext(isOpen$, {
    elem: rx(
      isOpen$,
      render((isOpen) => {
        return (
          <Dialog isOpen={isOpen} onClose={() => (isOpen$.value = false)}>
            {r(isOpen$)}
          </Dialog>
        );
      }),
    ),
  });
};

export const useDialogModal = (opt: {
  $title: () => VNodeChild;
  $content: () => VNodeChild;
}) => {
  return useDialog(() => {
    return (
      <DialogContainer>
        <DialogHeadline>{opt.$title()}</DialogHeadline>
        <DialogContent>{opt.$content()}</DialogContent>
      </DialogContainer>
    );
  });
};

export const useDialogPrompt = (opt: {
  $title: () => VNodeChild;
  $content: () => VNodeChild;

  onConfirm?: () => void;
}) => {
  const dialog$ = useDialog(() => {
    return (
      <DialogContainer>
        <DialogHeadline>{opt.$title()}</DialogHeadline>
        <DialogContent
          component={"form"}
          onSubmit={(e) => {
            e.preventDefault();
            opt.onConfirm?.();
            dialog$.value = false;
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
          {opt.$content()}
        </DialogContent>
      </DialogContainer>
    );
  });

  return dialog$;
};

const Container = styled("div")({
  pos: "absolute",
  top: 0,
  left: 0,
  h: "100vh",
  w: "100vw",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  $data_dialog_backdrop: {
    cursor: "pointer",
    pos: "absolute",
    top: 0,
    left: 0,
    h: "100vh",
    w: "100vw",
    zIndex: -1,
    bgColor: variant("sys.scrim", alpha(0.38)),
  },
});

export const DialogContainer = styled("div")({
  p: 24,
  rounded: "sm",
  shadow: "3",
  minW: "50vw",
  containerStyle: "sys.surface-container-high",
  display: "flex",
  flexDirection: "column",
  gap: 16,
});

export const DialogHeadline = styled("div")({
  textStyle: "sys.headline-small",
});

export const DialogContent = styled(
  "div",
  {
    $action: t.custom<VNodeChild>().optional(),
    $default: t.custom<VNodeChild>().optional(),
  },
  ({}, { slots }) => {
    return (Wrap) => (
      <Wrap>
        {slots.default?.()}
        {slots.action && <div data-role={"action"}>{slots.action()}</div>}
      </Wrap>
    );
  },
)({
  display: "flex",
  flexDirection: "column",
  gap: 24,

  $data_role__action: {
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
});

const FadeInOutTransition = defineTransition(
  {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    duration: transition.duration.md1,
    easing: transition.easing.standard.accelerate,
  },
  {
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0,
    },
    duration: transition.duration.sm4,
    easing: transition.easing.standard.accelerate,
  },
);

export const Dialog = component(
  {
    isOpen: Overlay.propTypes!.isOpen,
    onClose: t.custom<() => void>(),
    $default: t.custom<VNodeChild>(),
  },
  (props, { slots, emit }) => {
    const animateToEnterOrLevel = ref(false);
    const mounted = ref(props.isOpen ?? false);

    watch(
      () => props.isOpen,
      (open) => {
        if (open === true) {
          // mount first，then animate enter
          mounted.value = true;
        } else if (open === false) {
          // animate leave first，then unmount
          animateToEnterOrLevel.value = false;
        }
      },
    );

    return () => {
      return (
        <Overlay
          isOpen={mounted.value}
          onEscKeydown={() => (animateToEnterOrLevel.value = false)}
          onContentBeforeMount={() => (animateToEnterOrLevel.value = true)}
        >
          <Container>
            <FadeInOutTransition
              onComplete={(t) => {
                if (t == "leave") {
                  mounted.value = false;
                  emit("close");
                }
              }}
            >
              {animateToEnterOrLevel.value ? (
                <div
                  data-dialog-backdrop={""}
                  onClick={() => (animateToEnterOrLevel.value = false)}
                />
              ) : null}
            </FadeInOutTransition>
            <>{slots.default?.()}</>
          </Container>
        </Overlay>
      );
    };
  },
);
