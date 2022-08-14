---
title: Cypress - 從類別中動態載入 plugin
publish_date: 2022-08-14
snippet: 在 Cypress 中如何動態載入 plugin
tags: [cypress, javascript, typescript]
---

近期因為測試需求需要讀取 Excel，而要在 `cypress` 中執行 `Node` 必須利用
[`cy.task`](https://docs.cypress.io/api/commands/task) 做為橋樑，有點像是 `electron` 的
[`ipcMain`](https://www.electronjs.org/docs/latest/api/ipc-main)，在網頁上發送事件來執行
`Node`。

在 `Cypress` 版本 10 之後，捨棄掉了在 `plugin/index.ts` 設定 task event 的方式，取而代之的是在新的
`cypress.config.ts` 中建立 task event。

```ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // ...
    setupNodeEvents(on, config) {
      on("task", {
        // 設定 task event
      });

      return config;
    },
  },
});
```

前面提到測試需要讀取 Excel，因此寫了專門處理 Excel 的類別（class），我想要將這個類別所有的 methods 都提出來建立成個別的
event，然而把 method 一個一個手動寫進 event 明顯是個沒有效率的做法，未來擴充 method 的時候就需要一直手動的添加 event...

```ts
import { defineConfig } from 'cypress';
import { ExcelReader } from './cypress/plugin';

export default defineConfig({
  e2e: {
    // ...
    setupNodeEvents(on, config) {
      const excelReader = new ExcelReader(config);

      on('task', {
        // 這個 plugin class 有幾個 methods 就必須手動寫幾次
        readXlsx: (filepath: string) => excelReader.readXlsx.bind(excelReader);
      });

      return config;
    },
  },
});
```

雖然全部寫成 function 再 export 是個簡單的作法，但我想要為我的 plugin 都引入 config 這個參數，ES6 的 class
語法糖可以很輕鬆地繼承父類別的方法和參數：

```ts
// cypress/plugin/Plugin.ts
export default abstract class Plugin {
  constructor(protected config: Cypress.PluginConfigOptions) {}
}

// cypress/plugin/ExcelReader.ts
import xlsx from "node-xlsx";
import { join } from "path";
import Plugin from "./Plugin";

export default class ExcelReader extends Plugin {
  readXlsx(filename: string) {
    return xlsx.parse(join(this.config.downloadsFolder, filename));
  }

  // ...
}
```

## 從實例中提取 method

我們會在 `cypress.config.ts` 中新建 `ExcelReader` 實例，但要如何從 instance 提取呢？

從實例中取得 property 名稱與 value，如果 value 是 function 的話，將它存成 `object` 的 key 與
value，當然這時候的 value 是沒有辦法存取實例中的 config 的，因此要記得把 value 綁定實例，最後再返回這個 `object`。

```ts
// cypress/support/utils
import type Plugins from "../../plugins/Plugin";

export function getMethodFromInstance(instance: Plugins) {
  return Object.getOwnPropertyNames(instance).reduce((task, key) => {
    if (typeof Object.getPrototypeOf(key) === "function") {
      task[`${instance.constructor.name}_${key}`] = Object.getPrototypeOf(key)
        .bind(instance);
    }
    return task;
  }, {} as Record<string, (...args: any) => any>);
}
```

可以注意到上面在 assign task 的 key 時，並不是直接存實例的 key，而是在前面又加上了類別的名稱，這是因爲如果 plugin 之間有重複名稱的
method 出現，後 import 的 method 就會將前面的 method 給覆蓋，所以算是一個權宜之計。

## 將 method 加入 event

有了 `getMethodFromInstance` 後，就可以利用 Spread Operator 將提取出來的 key 和 value 放入 task
event 中。

```ts
import { defineConfig } from "cypress";
import { ExcelReader } from "./cypress/plugin";
import { getMethodFromInstance } from "./cypress/support/utils";

export default defineConfig({
  e2e: {
    //...
    setupNodeEvents(on, config) {
      const excelReader = new ExcelReader(config);

      on("task", {
        ...getMethodFromInstance(excelReader),
      });

      return config;
    },
  },
});
```

## 載入 type

到以上的步驟是可以直接調用 `cy.task` 的，但是爲了要讓 VSCode 的 IntelliSense 發揮作用就必須宣告 types：

```ts
// global.d.ts

declare namespace Cypress {
  interface Chainable<Subject = any> {
    task(
      event: 'ExcelReader_readXlsx',
      arg?: string
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<string[]>;
  }
}
```

不過顯然會遇到和設定 task event 時一樣的問題，有幾個 method 就需要手動填入，而且因爲有設定 key 前面加上 plugin
的類別名稱，如果之後換名稱一個一個宣告 types 會造成維護上的困難。

下面雖然光是提取出有用的 type 宣告了一堆 type，但了解之後其實沒有那麽複雜，後續也只要專注在維護新增 plugin 或是更改 prefix
的問題，不過下面的 type 還有很多的改善空間，但總的來説已經能滿足我現階段的需求。

```ts
// global.d.ts

// 從 type 中提取 value 是 function 的 name
type FunctionPropertyNames<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T]
>;
// 將提取出來的 function name key 變成 union
type KeysOfUnion<T> = T extends T ? keyof FunctionPropertyNames<T> : never;
// 藉由提供的 type 與 key 去提出該 function 的 parameter 並 union
type ParametersUnion<T, K> = T extends T ? Parameters<T[K]> : never;
// 藉由提供的 type 與 key 去提出該 function 的 return type 並 union
type ReturnTypeUnion<T, K> = T extends T ? ReturnType<T[K]> : never;

type ValueOf<T> = T[keyof T];
// 類似 array 的 split，給定一個原始 string 與要 split 的 string，最後會返回一個 string array
type Split<S extends string, D extends string> = string extends S ? string[]
  : S extends "" ? []
  : S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>]
  : [S];
// 將原本的 key 都加上對應的 prefix
type AddPrefix<T extends Plugins> = T extends ExcelReader
  ? `ExcelReader_${KeysOfUnion<T>}`
  : T extends FolderReader ? `FolderReader_${KeysOfUnion<T>}`
  : never;
// 爲了正確的得到 type 的 value，需要將 prefix 給移除
type RemovePrefix<K> = Split<K, `${PluginsName}_`>[1];

// 取得所有在 plugins/index.ts 的 plugin instance union
type Plugins = InstanceType<ValueOf<typeof import("./plugins")>>;
type PluginsName = KeysOfUnion<typeof import("./plugins")>;
// 單獨取得 instance 將用於 AddPrefix 中
type ExcelReader = import("./plugins").ExcelReader;
type FolderReader = import("./plugins").FolderReader;

/**
 * 藉由 generic 讓 event key extends 增加 prefix 的 key name
 * 有了 key name 就可以取得相應的 parameter 與 return type
 */
declare namespace Cypress {
  interface Chainable<Subject = any> {
    task<K extends AddPrefix<Plugins>>(
      event: K,
      // 只拿第一個 parameter，因爲 task 只能接受一個
      arg?: ParametersUnion<Plugins, RemovePrefix<K>>[0],
      options?: Partial<Loggable & Timeoutable>,
    ): Chainable<ReturnTypeUnion<Plugins, RemovePrefix<K>>>;
  }
}
```
