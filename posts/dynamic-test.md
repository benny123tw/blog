---
title: Cypress - Generate Dynamic Test
publish_date: 2022-08-11
snippet: How to dynamic generate test in Cypress.io?
tags: [cypress, javascript, typescript]
---

使用 `forEach()` 動態生成測試項目

```ts
describe("Performance Test", () => {
  beforeEach(() => {
    // alias graphql
    aliasGql("queryPage");
  });

  const requiredPages = [
    { name: "setting", id: 1 },
    { name: "power", id: 2 },
    { name: "leakage", id: 3 },
  ];

  requiredPages.forEach(({ name, id }) => {
    it(`${name} page loading time should less than 3 sec`, () => {
      cy.visit(`/?pageID=${id}`);
      cy.wait("@queryPage", { timeout: 3000 });
    });
  });
});
```

## 使用時機

當有多個項目需要測試，並且測試內容大致相同

## 為什麼不用 for...loop?

Cypress 在開始測試之前會檢查所有的程式碼，找出需要測試的測項，傳統的 `for...loop`