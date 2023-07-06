import {
  rx,
  t,
  component$,
  FormData,
  type InputComponentProps,
  Field,
  render,
} from "@nodepkg/runtime";
import { combineLatest, Observable } from "@nodepkg/runtime/rxjs";
import { Box } from "@innoai-tech/vueuikit";
import { TextField } from "./TextField";
import { Menu, MenuItem } from "../Overlays";
import { Icon } from "../Icons";
import { mdiMenuDown, mdiPlusThick, mdiMinusThick } from "@mdi/js";
import { TextButton, IconButton } from "../Buttons";
import { last, isUndefined } from "@nodepkg/runtime/lodash";
import { onUnmounted } from "vue";
import { Divider } from "../Shapes";

export const FormControl = component$(
  {
    form$: t.custom<FormData<any>>(),
  },
  ({ form$ }, { render }) => {
    return rx(
      form$.inputs$,
      render(() => {
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...form$.fields(form$.typedef)].map((f) => {
              return <FieldControl key={f.name} field$={f} />;
            })}
          </Box>
        );
      }),
    );
  },
);

export const FieldControl = component$(
  {
    field$: t.custom<Field>(),
  },
  ({ field$ }, { render }) => {
    onUnmounted(() => {
      field$.destroy();
    });

    return rx(
      combineLatest([field$, field$.input$]),
      render(([s, value]) => {
        if (
          field$.typedef.type === "object" ||
          field$.typedef.type === "intersection"
        ) {
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...field$.form$.fields(field$.typedef, value, field$.path)].map(
                (f) => {
                  return <FieldControl key={f.name} field$={f} />;
                },
              )}
            </Box>
          );
        }

        let renderInput = field$.meta?.input;

        if (field$.typedef.type === "enums") {
          renderInput = createEnumSelectInput(
            (field$.typedef.getSchema("enum") ?? []).map((e: any) => {
              return {
                label: e,
                value: e,
              };
            }),
          );
        }

        if (field$.typedef.type === "boolean") {
          renderInput = createEnumSelectInput(
            [true, false].map((e) => {
              return {
                label: e ? "是" : "否",
                value: e,
              };
            }),
          );
        }

        if (!renderInput) {
          if (field$.typedef.type === "array") {
            return <FieldArray field$={field$} />;
          }

          renderInput = renderTextInput;
        }

        return (
          <TextField
            valued={!isUndefined(value ?? s.initial)}
            invalid={!!s.error}
            focus={!!s.focus}
            $label={
              <span>
                {field$.meta?.label ?? field$.name}
                {field$.optional ? "" : "*"}
              </span>
            }
            $supporting={<span>{s.error?.join("; ")}</span>}
            $trailing={(renderInput as any).$trailing}
          >
            {renderInput({
              type: field$.typedef.type,
              focus: s.focus,
              onFocus: () => field$.focus(),
              onBlur: () => field$.blur(),
              name: field$.name,
              readOnly:
                (field$.meta?.readOnlyWhenInitialExist ?? false) && !!s.initial,
              value: value ?? s.initial,
              onValueChange: (v) => {
                field$.update(v);
              },
            })}
          </TextField>
        );
      }),
    );
  },
);

export const FieldArray = component$(
  {
    field$: t.custom<Field>(),
  },
  ({ field$ }) => {
    return rx(
      combineLatest([field$, field$.input$ as Observable<any[]>]),
      render(([_, values]) => {
        return (
          <>
            <Divider />
            {values && (
              <>
                {[
                  ...field$.form$.fields(
                    field$.typedef,
                    values ?? [],
                    field$.path,
                  ),
                ].map((fieldItem) => {
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <IconButton
                        type="button"
                        onClick={() => {
                          field$.update(
                            values.filter((_, i) => i !== last(fieldItem.path)),
                          );
                        }}
                      >
                        <Icon path={mdiMinusThick} />
                      </IconButton>
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <FieldControl key={fieldItem.name} field$={fieldItem} />
                      </Box>
                    </Box>
                  );
                })}
              </>
            )}
            <TextButton
              type="button"
              onClick={() => {
                field$.update([...(values ?? []), undefined]);
              }}
            >
              <Icon path={mdiPlusThick} />
              {field$.label}
            </TextButton>
            <Divider />
          </>
        );
      }),
    );
  },
);

const renderTextInput = ({
  readOnly,
  onValueChange,
  ...others
}: InputComponentProps<any>) => {
  return (
    <input
      {...others}
      data-input=""
      type={"text"}
      readonly={readOnly}
      onChange={(e) => {
        onValueChange((e.target as HTMLInputElement).value);
      }}
    />
  );
};

export const createEnumSelectInput = (
  options: Array<{ label: string; value: any }>,
) =>
  Object.assign(
    ({
      name,
      value,
      onValueChange,
      focus,
      onFocus,
      onBlur,
    }: InputComponentProps<any>) => {
      return (
        <Menu
          isOpen={focus}
          onDidOpen={() => onFocus?.()}
          onDidClose={() => onBlur?.()}
          onSelected={(v) => {
            const o = options.find((o) => `${o.value}` == v);

            if (o) {
              onValueChange(o.value);
            }
          }}
          fullWidth
          $menu={
            <>
              {options.map((e) => (
                <MenuItem
                  key={e.value}
                  data-value={e.value}
                  active={e.value === value}
                >
                  {e.label}
                </MenuItem>
              ))}
            </>
          }
        >
          <input
            data-input=""
            name={name}
            type={"text"}
            value={
              options.find((o) => `${o.value}` == `${value}`)?.label ?? value
            }
            readonly={true}
            onFocus={() => onFocus?.()}
            onBlur={(e) => {
              if (e.relatedTarget) {
                onBlur?.();
              }
            }}
          />
        </Menu>
      );
    },
    {
      $trailing: <Icon path={mdiMenuDown} />,
    },
  );
