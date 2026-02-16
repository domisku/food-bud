import { Component } from "solid-js";

interface IHeadingProps {
  children?: any;
  class?: string;
}

const Heading: Component<IHeadingProps> = (props) => {
  return (
    <h1
      class={`font-extrabold text-xl mb-4 ${props.class || ""}`}
      style={{ animation: "fadeInUp 0.4s ease-out" }}
    >
      {props.children}
    </h1>
  );
};

export default Heading;
