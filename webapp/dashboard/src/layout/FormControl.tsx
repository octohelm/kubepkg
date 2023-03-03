import { isFunction, map } from "@innoai-tech/lodash";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select
} from "@mui/material";
import { createContext, useContext, useMemo, useId } from "react";
import { Subscribe } from "@nodepkg/runtime";
import {
  SchemaBuilder,
  InferSchema,
  FieldSubject,
  FormSubject,
  Schema
} from "@innoai-tech/form";

const FormContext = createContext<{ form$?: FormSubject<any> }>({});

const FormContextProvider = FormContext.Provider;

const useFormContext = () => {
  return useContext(FormContext).form$!;
};

export const useForm = <T extends object>(
  initials: Partial<T>,
  build: () => SchemaBuilder<InferSchema<T>>
) => {
  return useMemo(() => FormSubject.of<T>(build()(), initials), []);
};

export const useFormField = <T extends any = any>(name: string) => {
  const form$ = useFormContext();
  return useMemo(() => form$.register(name) as FieldSubject<T>, [name, form$]);
};

export const fromErrorFields = (
  errorFields: { field: string; msg: string }[]
) => {
  const errors: { [k: string]: string } = {};
  if (errorFields) {
    for (const v of errorFields) {
      errors[v.field] = v.msg;
    }
  }
  return errors;
};

const fieldKey = (name: string, parent = "") => {
  if (parent) {
    return `${parent}.${name}`;
  }
  return name;
};

const FormControlsFromSchema = ({
                                  schema,
                                  name
                                }: {
  schema: Schema;
  name?: string;
}) => {
  const id = useId();

  if (schema.type === "array") {
    // FIXME added array support
    return <></>;
  }

  if (schema.type === "object") {
    // FIXME added section wrap
    return (
      <>
        {map(schema.properties, (s, n) => {
          return (
            <FormControlsFromSchema
              key={n}
              name={fieldKey(n, name)}
              schema={s as Schema}
            />
          );
        })}
      </>
    );
  }

  const field$ = useFormField(name!);

  if (schema.type === "boolean") {
    return (
      <Subscribe value$={field$}>
        {(fieldState) => (
          <FormControlLabel
            control={<Checkbox />}
            value={fieldState?.value}
            label={schema.label}
            onChange={() => {
              field$.next(!fieldState?.value);
            }}
          />
        )}
      </Subscribe>
    );
  }

  if (schema.type === "string" || schema.type === "number") {
    return (
      <Subscribe value$={field$}>
        {(field) => {
          if (!field) {
            return null;
          }
          const { visited, value, error } = field;

          const validate = field$.validate;

          const isRequired = validate?.args.some((e) => e.type === "required");
          const oneOf = validate?.args
            ?.find((e) => e.type === "oneOf")
            ?.args.filter((arg: any) => !isFunction(arg));

          const shouldShowError = visited && error;

          const input = oneOf ? (
            <Select
              id={id}
              value={value || ""}
              readOnly={!!schema.readOnly}
              onChange={(e) => {
                field$.next(e.target.value);
              }}
              onFocus={() => {
                field$.focus();
              }}
              onBlur={() => {
                field$.blur();
              }}
            >
              {oneOf.map((v: any) => (
                <MenuItem key={`${v}`} value={v as string}>
                  {`${v}`}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Input
              id={id}
              value={value || ""}
              readOnly={!!schema.readOnly}
              onChange={(e) => {
                field$.next(e.target.value);
              }}
              onFocus={() => {
                field$.focus();
              }}
              onBlur={() => {
                field$.blur();
                field$.check(validate);
              }}
              {...(schema.type === "number"
                ? {
                  inputMode: "numeric",
                  pattern: "[0-9]*"
                }
                : {})}
            />
          );

          return (
            <FormControl
              variant="standard"
              fullWidth={true}
              required={!!isRequired}
              error={!!shouldShowError}
            >
              <InputLabel shrink={true} htmlFor={id}>
                {schema.label}
              </InputLabel>
              {input}
              <FormHelperText>
                {shouldShowError ? error : schema.desc}
              </FormHelperText>
            </FormControl>
          );
        }}
      </Subscribe>
    );
  }

  return null;
};

export const FormControls = <T extends object>({
                                                 form$
                                               }: {
  form$: FormSubject<T>;
}) => {
  return (
    <FormContextProvider value={{ form$ }}>
      <FormControlsFromSchema schema={form$.schema} />
    </FormContextProvider>
  );
};
