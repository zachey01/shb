import inquirer from "inquirer";
import chalk from "chalk";
import { downloadDirectory, runAfterInstall } from "./config.js";
import { chooseApp } from "./ui.js";
import { clearApps } from "./config.js";

export function settingsMenu() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDirectory",
        message: `Current download directory is ${downloadDirectory}. Enter new directory path or press Enter to keep the same:`,
        default: downloadDirectory,
      },
      {
        type: "confirm",
        name: "newRunAfterInstall",
        message:
          "Change whether to run applications immediately after installation?",
        default: runAfterInstall,
      },
      {
        type: "list",
        name: "settingsOption",
        message: "Choose an additional setting:",
        choices: [
          {
            name: "🧹 Clear All Installed Apps",
            value: "clear_apps",
          },
          {
            name: "Return to Application Menu",
            value: "return",
          },
        ],
      },
    ])
    .then(async (answers) => {
      if (
        answers.newDirectory !== downloadDirectory ||
        answers.newRunAfterInstall !== runAfterInstall
      ) {
        downloadDirectory = answers.newDirectory;
        runAfterInstall = answers.newRunAfterInstall;

        const config = { downloadDirectory, runAfterInstall };
        await fs.promises.writeFile(
          path.join(__dirname, "config.json"),
          JSON.stringify(config),
          "utf-8"
        );

        console.log(chalk.green("Settings updated successfully."));
      } else {
        console.log(chalk.yellow("No changes made to settings."));
      }

      if (answers.settingsOption === "clear_apps") {
        await clearApps();
        chooseApp();
      } else {
        chooseApp();
      }
    })
    .catch((error) => {
      console.error(chalk.red("Error updating settings:"), error);
    });
}
