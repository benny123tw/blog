---
title: Cypress - 與下載下來的檔案交互
publish_date: 2022-08-30
snippet: 在 Cypress 中如何與下載後的檔案進行交互
tags: [cypress, javascript, typescript]
---

```ts
import { existsSync, mkdirSync, readdirSync, rmSync } from "fs";
import path from "path";
import { Plugin } from "./plugin";

/**
 * Interact with download behavior
 */
export class DownloadPlugin extends Plugin {
  downloadsFolder: string;

  constructor(config: Cypress.PluginConfigOptions) {
    super(config);
    this.downloadsFolder = config.downloadsFolder;
  }

  findFileInFolder(searchInputs: string[]): Promise<string> {
    const delay = 1000;
    return new Promise((resolve, reject) => {
      mkdirSync(this.downloadsFolder, { recursive: true });
      const files = readdirSync(this.downloadsFolder);

      const found = files.find((filename: string) => {
        return searchInputs.every((s: string) => filename.includes(s));
      });

      if (found && !found.includes("crdownload")) {
        resolve(path.join(this.config.downloadsFolder, found));
        return;
      }

      setTimeout(() => {
        this.findFileInFolder(searchInputs).then(resolve, reject);
      }, delay);
    });
  }

  readFolderUntilMatch(filesLength: number): Promise<string[]> {
    const delay = 1000;
    return new Promise((resolve, reject) => {
      mkdirSync(this.downloadsFolder, { recursive: true });
      const files = readdirSync(this.downloadsFolder);

      if (
        files.length &&
        !files.some((filename) => filename.includes("crdownload")) &&
        files.length >= filesLength
      ) {
        resolve(files);
        return;
      }

      setTimeout(() => {
        this.readFolderUntilMatch(filesLength).then(resolve, reject);
      }, delay);
    });
  }

  readFolder() {
    return readdirSync(this.downloadsFolder);
  }

  isFolderExist() {
    return existsSync(this.downloadsFolder);
  }

  clearFolder() {
    if (this.isFolderExist()) {
      rmSync(this.downloadsFolder, { recursive: true, force: true });
    }

    // Note: The command will fail if undefined is returned
    // or if the promise is resolved with undefined.
    return null;
  }
}
```
