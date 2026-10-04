import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    schemas: "src/schemas/index.ts",
    server: "src/server/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  platform: "neutral",
  publint: false,
  attw: false,
  deps: {
    neverBundle: ["better-auth", "hono", "zod", "react", "react-dom"],
  },
});
