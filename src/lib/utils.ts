import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FILE_EXLCUDE_LIST = [
  "README.md",
  "LICENSE",
  ".github",
  ".gitignore",
  ".pre-commit-config.yaml",
  "test",
  "ruff.toml",
  "requirements.txt",
  "public",
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "postcss.config.js",
  "src/components/ui",
  "components.json",
  "src/app/globals.css",
  "eslint.config.mjs",
  "postcss.config.mjs",
  "tsconfig.json",
  "next.config.ts",
  "prompts.ts"
]
