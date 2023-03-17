import { Component } from "solid-js";

interface ITagProps {
  children?: any;
}

const Tag: Component<ITagProps> = (props) => {
  return (
    <span class="rounded-xl border border-gray-200 py-1 px-2 text-sm">
      {props.children}
    </span>
  );
};

export default Tag;
