export default {
  "maxConcurrency": 10,
  "transform": {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  "moduleNameMapper": {},
  "moduleFileExtensions": ["tsx", "ts", "json", "jsx", "js"],
  "extensionsToTreatAsEsm": [".tsx", ".ts"],
  "modulePaths": ["<rootDir>"],
  "testPathIgnorePatterns": ["/node_modules/"],
  "testRegex": ".*/__tests__/.+\\.(generator|test|spec)\\.(ts|tsx)$"
};