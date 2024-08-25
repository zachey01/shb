# Self-Host Browser (shb)

## Overview

**Self-Host Browser (shb)** is a command-line interface (CLI) tool designed for managing self-hosted applications. It provides functionalities to install, update, run, and manage applications hosted in Git repositories. It also supports configuring autostart settings and managing application directories.

## Table of Contents

- [Self-Host Browser (shb)](#self-host-browser-shb)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
    - [Configuration File Structure](#configuration-file-structure)
  - [Features](#features)
  - [Commands](#commands)
    - [Start](#start)
    - [Manage Applications](#manage-applications)
    - [Settings](#settings)
  - [Configuration Files](#configuration-files)
    - [`config.json`](#configjson)
    - [`apps.json`](#appsjson)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

To install **shb** globally, you can use either `npm` or `yarn`:

```bash
npm install shb -g
```

or

```bash
yarn global add shb
```

## Usage

To start the Self-Host Browser, run:

```bash
npx shb
```

This command will launch the CLI, allowing you to interact with the application menu, manage installed apps, and configure settings.

## Configuration

**shb** uses a `config.json` file to store configuration settings. The configuration file includes:

- **downloadDirectory**: The directory where applications will be downloaded.
- **runAfterInstall**: A boolean flag indicating whether applications should be run immediately after installation.

You can specify these settings during the first run of the application, or update them via the settings menu.

### Configuration File Structure

```json
{
  "downloadDirectory": "/path/to/directory",
  "runAfterInstall": true
}
```

## Features

- **Manage Applications**: Install, update, run, and manage applications from Git repositories.
- **Autostart Configuration**: Enable or disable autostart for applications.
- **Pagination and Search**: Navigate through application lists with pagination and search functionality.
- **Settings Management**: Update configuration settings, including the download directory and autostart options.
- **Clear Installed Apps**: Remove all installed applications with a single command.

## Commands

### Start

```bash
npx shb
```

Starts the application and opens the main menu.

### Manage Applications

From the application menu, you can choose from the following actions for each application:

- **Install**: Clone the repository and install dependencies.
- **Update**: Pull the latest changes from the repository.
- **Run**: Execute the application.
- **Enable Autostart**: Set the application to start automatically on boot.
- **Disable Autostart**: Remove the application from the autostart list.

### Settings

Access the settings menu to:

- **Update Download Directory**: Change the directory where applications are downloaded.
- **Toggle Autostart**: Enable or disable running applications immediately after installation.
- **Clear Installed Apps**: Remove all installed applications.

## Configuration Files

### `config.json`

The `config.json` file is used for storing configuration settings. Ensure this file is in the same directory as `index.js`.

### `apps.json`

This file should be placed in the same directory as `index.js` and should include an array of applications you want to manage.

**Example `apps.json`:**

```json
{
  "apps": [
    {
      "name": "MyApp",
      "description": "This is my application",
      "gitUrl": "https://github.com/yourusername/myapp.git",
      "installCommand": "npm install",
      "setupCommand": "npm run build",
      "startCommand": "npm start"
    }
  ]
}
```

## Contributing

To contribute to **shb**, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and test them thoroughly.
4. Submit a pull request with a detailed description of your changes.

## License

**shb** is licensed under the MIT License. See [LICENSE](LICENSE) for details.
