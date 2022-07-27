export const stringAvatar = (s: string = "") => {
  return s
    .split("-")
    .map((v) => (v[0] || "").toUpperCase())
    .filter((v) => v)
    .join("");
};
