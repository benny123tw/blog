import { ga } from "blog";
import type { BlogSettings } from "blog_type";

const description =
  `Hi I'm Benny! I'm an QA engineer and I'm a big fan of TypeScript.`;

export const blogSettings: BlogSettings = {
  title: "Benny's Blog",
  description,
  lang: "zh-tw",
  dateStyle: "full",
  favicon: "/static/favicon.png",
  avatar: "/static/momosuzu-nene.gif",
  avatarClass: "rounded-full",
  author: "Benny Yen",
  links: [
    { title: "benny123tw@gmail.com", url: "mailto:benny123tw@gmail.com" },
    { title: "GitHuFb", url: "https://github.com/benny123tw" },
    { title: "Twitter", url: "https://twitter.com/benny123tw" },
    { title: "Instagram", url: "https://instagram.com/benny123tw" },
  ],
  // middlewares: [

  // If you want to set up Google Analytics, paste your GA key here.
  // ga("UA-XXXXXXXX-X"),

  // If you want to provide some redirections, you can specify them here,
  // pathname specified in a key will redirect to pathname in the value.
  // redirects({
  //  "/hello_world.html": "/hello_world",
  // }),

  // ]
  middlewares: [ga("G-9VKSH9VEQH")],
};
