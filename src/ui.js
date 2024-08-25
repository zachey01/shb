import inquirer from "inquirer";
import chalk from "chalk";
import { manageApp } from "./appManager.js";
import { paginateApps } from "./utils/file.js";
import { apps, downloadDirectory } from "./config.js";
import { settingsMenu } from "./settings.js";
import { PAGE_SIZE } from "./types.js";
import { checkInstalled } from "./utils/file.js";
import { runAfterInstall } from "./config.js";

export function chooseApp(pageIndex = 0, searchQuery = "") {
  let filteredApps = apps;

  if (searchQuery) {
    filteredApps = apps.filter((app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE);
  const paginatedApps = paginateApps(filteredApps, pageIndex);

  inquirer
    .prompt([
      {
        type: "list",
        name: "app",
        message: "Select an application to install, manage, or clear:",
        choices: [
          ...paginatedApps.map((app) => ({
            name: `${app.name} (${
              checkInstalled(app) ? "Installed" : "Not Installed"
            }) - ${app.description}`,
            value: app,
          })),
          new inquirer.Separator(),
          {
            name: "← Previous Page",
            value: "prev",
            disabled: pageIndex === 0,
          },
          {
            name: "→ Next Page",
            value: "next",
            disabled: pageIndex >= totalPages - 1,
          },
          new inquirer.Separator(),
          {
            name: "🔍 Search",
            value: "search",
          },
          {
            name: "⚙️  Settings",
            value: "settings",
          },
          new inquirer.Separator(),
        ],
      },
    ])
    .then((answer) => {
      if (answer.app === "next") {
        chooseApp(pageIndex + 1, searchQuery);
      } else if (answer.app === "prev") {
        chooseApp(pageIndex - 1, searchQuery);
      } else if (answer.app === "search") {
        searchApps();
      } else if (answer.app === "settings") {
        settingsMenu();
      } else {
        const app = answer.app;
        console.log(chalk.blue(`You selected: ${app.name}`));
        manageApp(app);
      }
    })
    .catch((error) => {
      console.error(chalk.red("Error selecting application:"), error);
    });
}

function searchApps() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "searchQuery",
        message: "Enter the name of the application to search:",
      },
    ])
    .then((answer) => {
      chooseApp(0, answer.searchQuery);
    })
    .catch((error) => {
      console.error(chalk.red("Error searching for application:"), error);
    });
}
