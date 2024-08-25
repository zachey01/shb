import simpleGit from "simple-git";
import ora from "ora";

export function cloneRepository(repoUrl, clonePath) {
  const git = simpleGit();
  const cloneSpinner = ora(`Cloning ${repoUrl}...`).start();

  return git
    .clone(repoUrl, clonePath)
    .then(() => {
      cloneSpinner.succeed(`Repository successfully cloned.`);
    })
    .catch((error) => {
      cloneSpinner.fail(`Error cloning repository: ${error}`);
      throw error;
    });
}

export function pullUpdates(repoPath) {
  const git = simpleGit(repoPath);
  const spinner = ora(`Pulling updates...`).start();

  return git
    .pull()
    .then((update) => {
      if (update && update.summary.changes) {
        spinner.succeed(`Updates pulled successfully.`);
      } else {
        spinner.info(`No updates available.`);
      }
    })
    .catch((error) => {
      spinner.fail(`Error pulling updates: ${error}`);
      throw error;
    });
}
