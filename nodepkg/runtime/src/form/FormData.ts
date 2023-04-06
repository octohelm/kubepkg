import { type AnyType } from "@innoai-tech/vuekit";
import { FormData as OriginFormData } from "@innoai-tech/vueformdata";
import type { RespError } from "../request";

export class FormData<T extends AnyType = AnyType> extends OriginFormData<T> {
  static errorFromRespError(error: RespError) {
    const errors: { [k: string]: string[] } = {};
    if (error.errorFields) {
      for (const v of error.errorFields) {
        errors[v.field] = [v.msg];
      }
    }
    return errors;
  }
}
