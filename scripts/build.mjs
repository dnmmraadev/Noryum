import { spawn } from "node:child_process";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export const binary =
  process.platform === "win32"
    ? require.resolve("@esbuild/win32-x64/esbuild.exe")
    : require.resolve(
        `@esbuild/${process.platform}-${process.arch}/bin/esbuild`,
      );
await mkdir("dist", { recursive: true });
await copyFile("assets/icon.png", "dist/icon.png");
await copyFile("assets/icon.ico", "dist/icon.ico");
export const args = [
  "src/main.tsx",
  "--bundle",
  "--minify",
  "--sourcemap",
  "--format=esm",
  "--target=chrome130",
  "--outfile=dist/app.js",
  '--define:process.env.NODE_ENV="production"',
];
await new Promise((resolve, reject) => {
  const child = spawn(binary, args, { stdio: "inherit" });
  child.on("error", reject);
  child.on("exit", (code) =>
    code === 0 ? resolve() : reject(Error(`Build failed: ${code}`)),
  );
});
await writeFile(
  "dist/index.html",
  `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'"><title>Noryum</title><meta name="application-name" content="Noryum"><meta name="description" content="Noryum - Intelligent Business Engineering"><link rel="icon" href="./icon.ico"><link rel="stylesheet" href="./app.css"></head><body><div id="root"></div><script type="module" src="./app.js"></script></body></html>`,
);
console.log("Production frontend built successfully.");
