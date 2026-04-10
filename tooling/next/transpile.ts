import { readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_PATH = resolve(__dirname, "../..");

const SEARCH_DIRS = ["apps", "packages", "tooling"];

function isPackageDir(path: string): boolean {
  try {
    const stats = statSync(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function readPackageName(pkgPath: string): string | null {
  try {
    const content = JSON.parse(readFileSync(pkgPath, "utf8"));
    if (content.name && typeof content.name === "string") return content.name;
    return null;
  } catch {
    return null;
  }
}

export function transpilePackages(): string[] {
  const transpilePackages: string[] = [];

  for (const dir of SEARCH_DIRS) {
    const fullDir = join(ROOT_PATH, dir);
    if (!isPackageDir(fullDir)) continue;

    const subDirs = readdirSync(fullDir).map((d) => join(fullDir, d));

    for (const sub of subDirs) {
      const pkgJsonPath = join(sub, "package.json");
      if (!pkgJsonPath.includes("root") && statSync(sub).isDirectory()) {
        const name = readPackageName(pkgJsonPath);
        if (name && !transpilePackages.includes(name)) {
          transpilePackages.push(name);
        }
      }
    }
  }

  return transpilePackages;
}
