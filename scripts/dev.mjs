import { spawn } from "node:child_process";
import { args, binary } from "./build.mjs";
const child = spawn(
  binary,
  [...args, "--watch=forever", "--servedir=dist", "--serve=127.0.0.1:5173"],
  { stdio: "inherit" },
);
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code || 0;
});
console.log(
  "Development: http://127.0.0.1:5173. Source changes rebuild automatically; refresh the page to view changes.",
);
