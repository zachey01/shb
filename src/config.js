import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { checkInstalled } from "./utils/file.js";

export let downloadDirectory = "";
export let runAfterInstall = true;
export let apps = [];

export async function loadApps() {
  try {
    const data = await fs.promises.readFile(
      new URL("../apps.json", import.meta.url),
      "utf-8"
    );
    apps = JSON.parse(data).apps;
  } catch (error) {
    console.error(chalk.red("Error loading apps.json:"), error);
  }
}

export async function askDownloadDirectory() {
  const configPath = path.join(process.cwd(), "config.json");

  if (fs.existsSync(configPath)) {
    const config = JSON.parse(await fs.promises.readFile(configPath, "utf-8"));
    downloadDirectory = config.downloadDirectory;
    runAfterInstall = config.runAfterInstall;
  } else {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "directory",
        message:
          "Enter the directory where applications should be downloaded (press Enter for default):",
        default: process.cwd(),
      },
      {
        type: "confirm",
        name: "runAfterInstall",
        message:
          "Do you want to run applications immediately after installation?",
        default: true,
      },
    ]);

    downloadDirectory = answer.directory;
    runAfterInstall = answer.runAfterInstall;

    const config = { downloadDirectory, runAfterInstall };
    await fs.promises.writeFile(configPath, JSON.stringify(config), "utf-8");
  }
}

export async function clearApps() {
  console.log(chalk.blue("Clearing all installed applications..."));

  const installedApps = apps.filter((app) => checkInstalled(app));

  if (installedApps.length === 0) {
    console.log(chalk.yellow("No applications are installed."));
    return;
  }

  const confirmation = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to clear ${installedApps.length} installed application(s)?`,
      default: false,
    },
  ]);

  if (!confirmation.confirm) {
    console.log(chalk.yellow("Operation cancelled."));
    return;
  }

  for (const app of installedApps) {
    const appPath = path.join(downloadDirectory, app.name);
    try {
      fs.rmSync(appPath, { recursive: true, force: true });
      console.log(chalk.green(`Successfully cleared ${app.name}.`));
    } catch (error) {
      console.error(chalk.red(`Error clearing ${app.name}: ${error.message}`));
    }
  }
}
