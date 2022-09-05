/** @jsx h */
import { h } from "blog";
import { forwardRef } from "preact/compat";

const Comment = forwardRef((props, commentBox) => {
  // deno-lint-ignore no-explicit-any
  return <div ref={commentBox as any} className="comments" />;
});

export default Comment;
