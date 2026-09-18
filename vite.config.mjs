import { defineConfig } from "vite";
import ts from "typescript";
// TypeScript's in-process transformer also works in restricted Windows environments
// where native build services cannot create their standard I/O pipes.
export default defineConfig({
  base: "./",
  resolve: { preserveSymlinks: true },
  esbuild: false,
  plugins: [
    {
      name: "typescript-transform",
      transform(code, id) {
        if (/\.[jt]sx?$/.test(id) && !id.includes("node_modules"))
          return {
            code: ts.transpileModule(code, {
              compilerOptions: {
                target: ts.ScriptTarget.ES2022,
                module: ts.ModuleKind.ESNext,
                jsx: ts.JsxEmit.ReactJSX,
                sourceMap: true,
              },
              fileName: id,
            }).outputText,
            map: null,
          };
      },
    },
  ],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: { graph: ["@xyflow/react"], icons: ["lucide-react"] },
      },
    },
  },
  test: { pool: "threads", include: ["src/**/*.test.ts"] },
});
