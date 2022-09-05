---
title: Cypress - 與下載下來的檔案交互
publish_date: 2022-08-30
snippet: 在 Cypress 中如何與下載後的檔案進行交互
tags: [cypress, javascript, typescript]
---

## 前言

我測試的網站有下載檔案的需求，並且下載的檔名是動態的，因此寫了一個 plugin 來調用 node module，以讀取 download folder
的資料夾內容。

每個 plugin class 都必須帶入由 `setupNodeEvents` 提供的 `Cypress.PluginConfigOptions`。

## 在資料夾中尋找對應的檔案

由於 Cypress 原生並沒有可以等待下載的 command，在網上搜尋到了一段程式碼，並加以改良以符合我的需求。

從下面程式碼可以看到，這個 `findFileInFolder` 會回傳 Promise 結果；整個程式會在找到檔案前不停的
recursion，直到檔案被找到或是 `cy.task` 的 taskTimeout 時間到。

```ts
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
```

一開始其實是沒有 `if` 那段的，在經歷過無數次的失敗，才發現每次 Cypress 都顯示已經下載好檔案，但是讀取的時候總是沒有 data
或是找不到檔案的原因。

這個問題就是出在 Cypress 正在下載檔案的時候，檔名是 `檔名` +
`.crdownload`，在初版的程式中正是少了這段檢查，才會在結果中回傳奇怪的檔名，例如：`Lepin_Scenario_v10.xlsx.crdownload`。

## 完整的 `DownloadPlugin`

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
