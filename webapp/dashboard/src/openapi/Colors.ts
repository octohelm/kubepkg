import { toUpper } from "@innoai-tech/lodash";

export const getCodeColor = (code: number) => {
  if (code >= 400) {
    return "#F72B45";
  }
  if (code >= 300) {
    return "#FF8B00";
  }
  return "#23CBA0";
};

export const getMethodColor = (method: string) => {
  switch (toUpper(method)) {
    case "GET":
      return "#0282FF";
    case "POST":
      return "#23CBA0";
    case "PUT":
      return "#FF8B00";
    case "PATCH":
      return "#6E00CE";
    case "DELETE":
      return "#F72B45";
    default:
      return "#85929A";
  }
};
