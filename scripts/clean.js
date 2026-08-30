// Limpia artefactos de build y cache del proyecto Expo.
// Uso: npm run clean
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const dirs = [".expo", "dist", "web-build", ".cache"];
const files = ["metro-cache", "tsconfig.tsbuildinfo"];

for (const d of dirs) {
  const p = join(process.cwd(), d);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    console.log(`clean: eliminado ${d}/`);
  }
}
for (const f of files) {
  const p = join(process.cwd(), f);
  if (existsSync(p)) {
    rmSync(p, { force: true });
    console.log(`clean: eliminado ${f}`);
  }
}
console.log("clean: listo");
