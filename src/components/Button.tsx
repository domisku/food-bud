import { Component } from "solid-js";

interface IButtonProps {
  children: any;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
  variant?: "primary" | "secondary" | "text";
  class?: string;
}

const Button: Component<IButtonProps> = (props) => {
  const getButtonClasses = () => {
    switch (props.variant) {
      case "primary":
        return "bg-violet-600 hover:bg-violet-700 text-white";
      case "secondary":
        return "text-violet-700 bg-violet-100 hover:bg-violet-200";
      case "text":
        return "text-violet-600 hover:bg-violet-50 py-2";
      default:
        return "bg-violet-600 hover:bg-violet-700 text-white";
    }
  };

  return (
    <button
      class={`rounded-md px-2 py-3 font-bold ${getButtonClasses()} ${
        props.class
      }`}
      type={props.type ?? "submit"}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
