import { Component } from "solid-js";

interface IButtonProps {
  children: any;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
  variant?: "primary" | "secondary";
  class?: string;
}

const Button: Component<IButtonProps> = (props) => {
  return (
    <button
      class={`rounded-md ${
        props.variant === "secondary"
          ? "text-violet-700 bg-violet-100 hover:bg-violet-200"
          : "bg-violet-600 hover:bg-violet-700 text-white"
      } px-2 py-3  font-bold ${props.class}`}
      type={props.type ?? "submit"}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
