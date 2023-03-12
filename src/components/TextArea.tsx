import { Component } from "solid-js";

interface ITextAreaProps {
  id: string;
  placeholder?: string;
  value?: string;
}

const TextArea: Component<ITextAreaProps> = (props) => {
  return (
    <textarea
      id={props.id}
      name={props.id}
      class="bg-violet-50 rounded-md outline-violet-900 px-4 py-2 w-full mb-4 mt-2 placeholder-gray-500"
      cols="30"
      rows="10"
      placeholder={props.placeholder}
      value={props.value ?? ""}
    />
  );
};

export default TextArea;
