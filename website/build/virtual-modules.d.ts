// TypeScript refuses to resolve `virtual:`-prefixed specifiers because they
// look like absolute URIs, so the shapes are attached with type-level dynamic
// imports, which do resolve inside an ambient module declaration.
declare module "virtual:gptars/docs" {
  export const docs: import("./docs-vite-plugin").DocEntry[];
  const docsDefault: import("./docs-vite-plugin").DocEntry[];
  export default docsDefault;
}

declare module "virtual:gptars/parameters" {
  export const parameters: import("./docs-vite-plugin").ParameterEntry[];
  const parametersDefault: import("./docs-vite-plugin").ParameterEntry[];
  export default parametersDefault;
}
