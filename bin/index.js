#!/usr/bin/env node

import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = {
  success: (msg) => console.log(`${chalk.green("🎉")} ${msg}`),
  error: (msg) => console.log(`${chalk.red("❌")} ${msg}`),
};

async function main() {
  const { pkgManager } = await prompts({
    type: "select",
    name: "pkgManager",
    message: "Which package manager do you use?",
    choices: [
      { title: "npm", value: "npm" },
      { title: "yarn", value: "yarn" },
      { title: "pnpm", value: "pnpm" },
    ],
    initial: 0,
  });

  const deps = [
    "@kaehehehe/eslint-config@latest",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint",
    "eslint-config-prettier",
    "eslint-plugin-import-x",
    "eslint-plugin-prettier",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh",
    "eslint-plugin-unused-imports",
    "prettier",
  ];

  await execa(pkgManager, [
    pkgManager === "npm" ? "install" : "add",
    "-D",
    ...deps,
  ]);

  const eslintPath = path.resolve("eslint.config.mjs");

  const eslintTemplatePath = path.join(
    __dirname,
    "../template/eslint.config.mjs"
  );

  const eslintTemplateContent = await fs.readFile(eslintTemplatePath);

  await fs.writeFile(eslintPath, eslintTemplateContent);

  const prettierPath = path.resolve("prettier.json");
  await fs.writeFile(
    prettierPath,
    JSON.stringify(
      {
        semi: true,
        trailingComma: "all",
        printWidth: 80,
        useTabs: false,
        tabWidth: 2,
        jsxBracketSameLine: false,
        jsxSingleQuote: false,
        arrowParens: "always",
        singleQuote: true,
      },
      null,
      2
    )
  );

  const vscodeSettingsPath = path.resolve(".vscode/settings.json");
  await fs.ensureFile(vscodeSettingsPath);

  const current = await fs.readJSON(vscodeSettingsPath).catch(() => ({}));

  const patched = {
    ...current,
    "eslint.useFlatConfig": true,
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact",
    ],
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
    },
    "editor.defaultFormatter": null,
    "editor.formatOnSave": false,
  };

  await fs.writeJSON(vscodeSettingsPath, patched, { spaces: 2 });

  log.success("Done!");
}

main().catch((err) => {
  log.error(err);
  process.exit(1);
});
