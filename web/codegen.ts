import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://127.0.0.1:4000/graphql",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        {
          "typescript-urql": {
            withComponent: false,
            withHooks: true,
            withHOC: false,
          },
        },
      ],
    },
  },
};

export default config;
