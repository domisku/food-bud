import { Component } from "solid-js";

interface ITagProps {
  children?: any;
}

const Tag: Component<ITagProps> = (props) => {
  return (
    <span class="rounded-xl border border-gray-200 py-2 px-3">
      {props.children}
    </span>
  );
};

export default Tag;
