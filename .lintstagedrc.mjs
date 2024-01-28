export default {
  "**/*": "prettier --write --ignore-unknown",
  "**/*.ts?(x)": () => "tsc -p tsconfig.json --noEmit",
};
