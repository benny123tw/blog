/**  @jsx h */
import { h } from "blog";
import { Fragment } from "preact";

function Footer(props: { author?: string }) {
  return (
    <Fragment>
      {
        <script
          src="https://utteranc.es/client.js"
          // deno-lint-ignore ban-ts-comment
          // @ts-ignore
          repo="benny123tw/blog"
          issue-term="title"
          label="comment"
          theme="github-dark"
          crossorigin="anonymous"
          async
        >
        </script>
      }
      <footer class="mt-20 pb-16 lt-sm:pb-8 lt-sm:mt-16">
        <p class="flex items-center gap-2.5 text-gray-400/800 dark:text-gray-500/800 text-sm">
          <span>
            &copy; {new Date().getFullYear()} {props.author} &middot; Powered by
            {" "}
            <a
              class="inline-flex items-center gap-1 underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              href="https://deno.land/x/blog"
            >
              Deno Blog
            </a>
          </span>
          <a
            href="/feed"
            class="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Atom Feed"
          >
            <IconRssFeed /> RSS
          </a>
        </p>
      </footer>
    </Fragment>
  );
}

function IconRssFeed() {
  return (
    <svg
      class="inline-block w-4 h-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
      <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
    </svg>
  );
}

export default Footer;
