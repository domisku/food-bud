import { Component } from "solid-js";
import { IdGen } from "../utils/id-gen";

interface ICheckboxProps {
  children: any;
  name?: string;
  checked?: boolean;
  onChange: (event?: Event) => void;
}

const Checkbox: Component<ICheckboxProps> = (props) => {
  const id = IdGen.generateId("checkbox");

  return (
    <label class="flex relative py-3 px-2 -mx-2 group cursor-pointer rounded-md hover:bg-gray-50 transition-colors" for={id}>
      <input
        checked={props.checked}
        class="peer sr-only"
        type="checkbox"
        id={id}
        name={props.name}
        onChange={props.onChange}
      />
      <span class="relative inline-block h-5 w-5 bg-gray-100 group-hover:bg-gray-200 my-auto mr-3 rounded before:content-DEFAULT before:hidden before:absolute before:top-0 before:left-0 before:w-5 before:h-5 before:bg-violet-600 before:rounded  before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:transform peer-checked:before:block"></span>
      <span class="flex-1">{props.children}</span>
    </label>
  );
};

export default Checkbox;
