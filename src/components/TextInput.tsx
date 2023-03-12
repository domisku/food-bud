import { Component } from "solid-js";

interface ITextInputProps {
  id: string;
  placeholder?: string;
  value?: string;
  type?: string;
}

const TextInput: Component<ITextInputProps> = (props) => {
  return (
    <input
      type={props.type ?? "text"}
      id={props.id}
      name={props.id}
      class="bg-violet-50 rounded-md outline-violet-900 px-4 py-2 w-full mb-4 mt-2 placeholder-gray-500"
      placeholder={props.placeholder}
      value={props.value ?? ""}
    />
  );
};

export default TextInput;
