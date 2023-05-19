const versionRe = /(?<base>.+)[.-](?<timestamp>[0-9]+)-(.+)$/;

export const getBaseVersion = (v: string) => {
  const m = v.match(versionRe);
  if (m) {
    return m.groups!["base"];
  }
  return v;
};