import fs from "fs";
import path from "path";
import { downloadDirectory } from "../config.js";
import { PAGE_SIZE } from "../types.js";

export function checkInstalled(app) {
  return fs.existsSync(path.join(downloadDirectory, app.name));
}

export function paginateApps(apps, pageIndex) {
  const start = pageIndex * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return apps.slice(start, end);
}
