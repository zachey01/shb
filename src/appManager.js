import { exec } from "child_process";
import simpleGit from "simple-git";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import { checkInstalled } from "./utils/file.js";
import { downloadDirectory, runAfterInstall } from "./config.js";
import inquirer from "inquirer";
import autostarter from "autostarter";

export function manageApp(app) {
  const installed = checkInstalled(app);
  console.log(
    chalk.blue(
      `Managing application: ${app.name} (${
        installed ? "Installed" : "Not Installed"
      })`
    )
  );

  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Choose an action:",
        choices: [
          {
            name: "Install",
            value: "install",
            disabled: installed ? "Installed: choose update or run" : false,
          },
          {
            name: "Update",
            value: "update",
            disabled: !installed ? "Installation required" : false,
          },
          {
            name: "Run",
            value: "run",
            disabled: !installed ? "Installation required" : false,
          },
          {
            name: "Enable Autostart",
            value: "autostart_enable",
            disabled: !installed ? "Installation required" : false,
          },
          {
            name: "Disable Autostart",
            value: "autostart_disable",
            disabled: !installed ? "Installation required" : false,
          },
        ],
      },
    ])
    .then((answer) => {
      console.log(chalk.blue(`You chose action: ${answer.action}`));
      switch (answer.action) {
        case "install":
          cloneAndSetupApp(app);
          break;
        case "update":
          updateApp(app);
          break;
        case "run":
          runApp(app);
          break;
        case "autostart_enable":
          addToAutostart(app);
          break;
        case "autostart_disable":
          removeFromAutostart(app);
          break;
      }
    })
    .catch((error) => {
      console.error(chalk.red("Error selecting action:"), error);
    });
}

export function cloneAndSetupApp(app) {
  console.log(chalk.blue(`Cloning and setting up application ${app.name}...`));
  const cloneSpinner = ora(`Cloning ${app.name}...`).start();

  const git = simpleGit();

  const repoUrl = app.gitUrl;
  const clonePath = path.join(downloadDirectory, app.name);

  git
    .clone(repoUrl, clonePath)
    .then(() => {
      cloneSpinner.succeed(`Repository ${app.name} successfully cloned.`);

      if (app.installCommand) {
        installDependencies(app, clonePath);
      } else {
        setupApp(app, clonePath);
      }
    })
    .catch((error) => {
      cloneSpinner.fail(`Error cloning repository ${app.name}: ${error}`);
    });
}

function installDependencies(app, clonePath) {
  console.log(
    chalk.blue(
      `Installing dependencies for ${app.name} with command: ${app.installCommand}`
    )
  );

  const installSpinner = ora(
    `Installing dependencies for ${app.name}...`
  ).start();

  exec(app.installCommand, { cwd: clonePath }, (error, stdout, stderr) => {
    if (error) {
      installSpinner.fail(
        `Error installing dependencies for ${app.name}: ${error}`
      );
      return;
    }

    const lines = stdout.split("\n").filter((line) => line.trim() !== "");
    let installedCount = 0;

    lines.forEach((line, index) => {
      setTimeout(() => {
        installedCount++;
        installSpinner.text = `Installing dependencies for ${app.name} (${installedCount}/${lines.length})...`;
        if (installedCount === lines.length) {
          installSpinner.succeed(
            `Dependencies for ${app.name} installed successfully.`
          );
          if (runAfterInstall) {
            runApp(app);
          }
        }
      }, index * 500);
    });

    if (stderr) {
      console.error(
        chalk.yellow(
          `Warning or error installing dependencies for ${app.name}:\n${stderr}`
        )
      );
    }

    if (app.setupCommand) {
      setupApp(app, clonePath);
    } else {
      console.log(chalk.green(`No additional setup required for ${app.name}.`));

      if (runAfterInstall) {
        runApp(app);
      }
    }
  });
}

function setupApp(app, clonePath) {
  console.log(
    chalk.blue(
      `Setting up application ${app.name} with command: ${app.setupCommand}`
    )
  );
  exec(app.setupCommand, { cwd: clonePath }, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red(`Error setting up ${app.name}:`), error);
      return;
    }

    console.log(
      chalk.green(`Application ${app.name} successfully set up:\n${stdout}`)
    );
    if (stderr) {
      console.error(
        chalk.yellow(`Warning or error setting up ${app.name}:\n${stderr}`)
      );
    }

    if (runAfterInstall) {
      runApp(app);
    }
  });
}

export function updateApp(app) {
  console.log(chalk.blue(`Updating application ${app.name}...`));
  const spinner = ora(`Updating ${app.name}...`).start();

  const git = simpleGit(path.join(downloadDirectory, app.name));

  git.pull((error, update) => {
    if (error) {
      spinner.fail(`Error updating ${app.name}: ${error}`);
      return;
    }

    if (update && update.summary.changes) {
      spinner.succeed(`${app.name} updated successfully.`);
      if (app.setupCommand) {
        setupApp(app, path.join(downloadDirectory, app.name));
      } else {
        console.log(
          chalk.green(`No additional setup required for ${app.name}.`)
        );
      }
    } else {
      spinner.info(`No updates available for ${app.name}.`);
    }
  });
}

export function runApp(app) {
  console.log(chalk.blue(`Running application ${app.name}...`));
  const spinner = ora(`Running ${app.name}...`).start();

  const process = exec(app.startCommand, {
    cwd: path.join(downloadDirectory, app.name),
  });

  process.stdout.on("data", (data) => {
    spinner.succeed(`${app.name} is running. Output:\n${data}`);
  });

  process.stderr.on("data", (data) => {
    spinner.fail(`${app.name} encountered an error:\n${data}`);
  });

  process.on("close", (code) => {
    if (code === 0) {
      console.log(chalk.green(`Application ${app.name} exited successfully.`));
    } else {
      console.error(
        chalk.red(`Application ${app.name} exited with code ${code}.`)
      );
    }
  });
}

export function addToAutostart(app) {
  console.log(chalk.blue(`Adding ${app.name} to autostart...`));
  const autostartCommand = app.startCommand;
  const appPath = path.join(downloadDirectory, app.name);

  autostarter
    .enableAutostart(app.name, autostartCommand, appPath)
    .then(() => console.log(chalk.green(`Autostart enabled for ${app.name}.`)))
    .catch((error) =>
      console.error(
        chalk.red(`Failed to enable autostart for ${app.name}: ${error}`)
      )
    );
}

export function removeFromAutostart(app) {
  console.log(chalk.blue(`Removing ${app.name} from autostart...`));

  autostarter
    .disableAutostart(app.name)
    .then(() => console.log(chalk.green(`Autostart disabled for ${app.name}.`)))
    .catch((error) =>
      console.error(
        chalk.red(`Failed to disable autostart for ${app.name}: ${error}`)
      )
    );
}
