import { configureBlog, createBlogHandler } from "blog";
import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.149.0/testing/asserts.ts";
// import { fromFileUrl, join } from "https://deno.land/std@0.149.0/path/mod.ts";

import { blogSettings } from "./settings.tsx";

if (blogSettings.middlewares?.length) {
  delete blogSettings.middlewares;
}

const BLOG_URL = new URL("./main.js", import.meta.url).href;
// const TESTDATA_PATH = fromFileUrl(new URL(import.meta.url));
const BLOG_SETTINGS = await configureBlog(BLOG_URL, false, blogSettings);
const CONN_INFO = {
  localAddr: {
    transport: "tcp" as const,
    hostname: "0.0.0.0",
    port: 8000,
  },
  remoteAddr: {
    transport: "tcp" as const,
    hostname: "0.0.0.0",
    port: 8001,
  },
};

const blogHandler = createBlogHandler(BLOG_SETTINGS);
const testHandler = (req: Request): Response | Promise<Response> => {
  return blogHandler(req, CONN_INFO);
};

Deno.test("index page", async () => {
  const resp = await testHandler(new Request("https://blog.deno.dev"));
  assert(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await resp.text();
  // assertStringIncludes(body, `<html lang="en-GB">`);
  assertStringIncludes(body, `Benny's Blog`);
  assertStringIncludes(
    body,
    `Hi I'm Benny! I'm an QA engineer and I'm a big fan of TypeScript.`,
  );
  assertStringIncludes(body, `href="/hello_world"`);
  assertStringIncludes(body, `href="/dynamic-test"`);
});
