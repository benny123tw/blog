/** @jsx h */

import blog, { ga, h, redirects } from "blog";
import type { BlogSettings } from "blog_type";
import "./extension/prismjs-extensions.ts";

export const blogSettings: BlogSettings = {
  title: "Benny's Blog",
  description: "My personal blog",
  // header: <header>Your custom header</header>,
  // section: <section>Your custom section</section>,
  // footer: <footer>Your custom footer</footer>,
  avatar: "https://deno-avatar.deno.dev/avatar/blog.svg",
  avatarClass: "rounded-full",
  author: "Benny Yen",
  // middlewares: [

  // If you want to set up Google Analytics, paste your GA key here.
  // ga("UA-XXXXXXXX-X"),

  // If you want to provide some redirections, you can specify them here,
  // pathname specified in a key will redirect to pathname in the value.
  // redirects({
  //  "/hello_world.html": "/hello_world",
  // }),

  // ]
};

blog(blogSettings);
