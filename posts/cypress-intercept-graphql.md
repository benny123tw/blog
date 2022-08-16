---
title: Cypress - Intercept GraphQL Request
publish_date: 2022-08-16
snippet: 本文會介紹我平常如何和 GraphQL 的 api 進行交互
tags: [cypress, javascript, typescript]
---

## 如何 intercept GraphQL 請求

如何 intercept GraphQL 在官方文件
[Cypress - Intercept](https://docs.cypress.io/guides/end-to-end-testing/working-with-graphql#What-you-ll-learn)
寫得很清楚了，本文會著重分享平常如何簡化流程。

基本上和官方文件的做法沒有區別，主要針對實際測試需求做出了一些調整。因爲測試的 api 已經用名字區分 query/mutation，因此沒有再針對
query/mutation 做處理。

```ts
// utils/intercept-utils.ts

import type { CyHttpMessages } from "cypress/types/net-stubbing";

export const getAliasName = (operationName: string) => {
  return `gql${operationName[0].toUpperCase()}${operationName.slice(1)}`;
};

export const hasOperationName = (
  req: CyHttpMessages.IncomingRequest,
  operationName: string,
) => {
  const { body } = req;
  return (
    Object.hasOwn(body, "operationName") && body.operationName === operationName
  );
};

// Alias query if operationName matches
export const aliasQuery = (operationName: string) => {
  return cy.intercept("POST", "/graphql", (req) => {
    if (hasOperationName(req, operationName)) {
      req.alias = getAliasName(operationName);
    }
  });
};
```

我寫了一個專門處理 intercept GraphQL 的 command，行爲和一般的 `intercept` 沒有差別，只是幫忙處理了
`operationName` 的檢查，以及前面重複的 `route`。

```ts
// support/commands.ts

import { hasOperationName } from "./utils/intercept-utils";

Cypress.Commands.add("interceptGql", (operationName, response) => {
  return cy.intercept("POST", "/graphql", (req) => {
    switch (typeof response) {
      case "function":
        hasOperationName(req, operationName) && response(req);
        break;
      default:
        hasOperationName(req, operationName) && req.reply(response);
    }
  });
});
```

寫了 custom commands 就需要定義好 type，才能夠發揮出 `typescript` + IntelliSense 的好處。

```ts
// global.d.ts

declare namespace Cypress {
  interface Chainable<Subject = any> {
    interceptGql(
      operationName: string,
      response: import("cypress/types/net-stubbing").RouteHandler,
    ): Chainable<null>;
  }
}
```

實際應用在測試上：

```ts
// e2e/spec.ts

import { aliasQuery } from "./support/utils/intercept-utils";

describe("intercept gql", () => {
  beforeEach(() => {
    aliasQuery("queryProjects");
  });

  it("query project and wait", () => {
    cy.visit("/projects");
    cy.wait("@gqlQueryProjects");
  });

  it("custom command", () => {
    // 行為同 intercept，只是省去處理 graphql 的步驟
    cy.interceptGql("queryProjects", {
      data: {
        queryProjects: {
          projects: [
            {
              id: 1,
            },
            {
              id: 2,
            },
          ],
        },
      },
    });

    cy.interceptGql("queryProjects", (req) => {
      req.reply({
        data: {
          queryProjects: {
            projects: [
              {
                id: 1,
              },
            ],
          },
        },
      });
    });
  });
});
```

有了這些設置，基本上可以應付我絕大多數的場景，即使需要一些客制化的 intercept graphql 的内容，也可以利用 `RouteHandler`
實現，可以説是爲我在撰寫測試項目節省了相當多的時間。
