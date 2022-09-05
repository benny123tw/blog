/** @jsx h */
import { h } from "blog";
import { blogSettings } from "../settings.tsx";
import { createRef, Fragment, useEffect } from "preact/compat";

import Comment from "./Comment.tsx";
import siteConfig from "../config/site-config.json" assert { type: "json" };

const PostFooter = () => {
  const commentBox = createRef();
  const theme = blogSettings?.theme ?? "dark";

  useEffect(() => {
    const commentScript = document.createElement("script");
    const commentsTheme = theme && theme === "dark"
      ? "github-dark"
      : "github-light";
    commentScript.async = true;
    commentScript.src = "https://utteranc.es/client.js";
    commentScript.setAttribute("repo", siteConfig.commentsRepo);
    commentScript.setAttribute("issue-term", "pathname");
    commentScript.setAttribute("id", "utterances");
    commentScript.setAttribute("label", "comment");
    commentScript.setAttribute("theme", commentsTheme);
    commentScript.setAttribute("crossorigin", "anonymous");
    if (commentBox && commentBox.current) {
      commentBox.current.appendChild(commentScript);
    } else {
      console.log(`Error adding utterances comments on: ${commentBox}`);
    }
    const removeScript = () => {
      commentScript.remove();
      document.querySelectorAll(".utterances").forEach((el) => el.remove());
    };
    return () => {
      removeScript();
    };
  }, [theme]);

  return (
    <Fragment>
      <Comment ref={commentBox} />
    </Fragment>
  );
};
export default PostFooter;
