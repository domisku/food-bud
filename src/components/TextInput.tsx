import { Component, JSX, splitProps } from "solid-js";

interface ITextInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  placeholder?: string;
  value?: string;
  type?: string;
}

const TextInput: Component<ITextInputProps> = (props) => {
  const [local, others] = splitProps(props, ["id", "placeholder", "value", "type"]);
  
  return (
    <input
      type={local.type ?? "text"}
      id={local.id}
      name={local.id}
      class="bg-violet-50 rounded-md outline-violet-900 px-4 py-2 w-full mb-4 mt-2 placeholder-gray-500"
      placeholder={local.placeholder}
      value={local.value ?? ""}
      {...others}
    />
  );
};

export default TextInput;
