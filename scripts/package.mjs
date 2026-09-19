import { cp, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { brandExecutable } from "./brand-executable.mjs";
const p = JSON.parse(await readFile("package.json", "utf8"));
const target = path.resolve(
  process.env.NORYUM_PACKAGE_DIR || `release/${p.version}/Noryum`,
);
await mkdir(target, { recursive: true });
await cp("node_modules/electron/dist", target, { recursive: true });
await rename(
  path.join(target, "electron.exe"),
  path.join(target, "Noryum.exe"),
);
await brandExecutable(path.join(target, "Noryum.exe"));
const app = path.join(target, "resources/app");
await mkdir(app, { recursive: true });
await cp("dist", path.join(app, "dist"), { recursive: true });
await cp("electron", path.join(app, "electron"), { recursive: true });
await writeFile(
  path.join(app, "package.json"),
  JSON.stringify({
    name: p.name,
    productName: "Noryum",
    version: p.version,
    main: p.main,
    description: p.description,
  }),
);
console.log("Windows application packaged: " + path.join(target, "Noryum.exe"));
