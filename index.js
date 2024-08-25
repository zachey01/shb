#!/usr/bin/env node
import { loadApps, askDownloadDirectory } from "./src/config.js";
import { chooseApp } from "./src/ui.js";
import chalk from "chalk";

async function main() {
  console.log(chalk.blue("Self Host Browser started."));
  await askDownloadDirectory();
  await loadApps();
  chooseApp();
}

main();
