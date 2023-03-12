import { Component } from "solid-js";

interface IHeadingProps {
  children?: any;
}

const Heading: Component<IHeadingProps> = (props) => {
  return <h1 class="font-extrabold text-xl mb-4">{props.children}</h1>;
};

export default Heading;
