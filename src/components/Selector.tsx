import { Component, createSignal, onCleanup } from "solid-js";

interface ISelectorProps {
  children?: any;
  placeholder?: string;
  openUp?: boolean;
  onClearAll?: () => void;
}

const Selector: Component<ISelectorProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const toggleDropdown = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const onOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const selector = target.closest(".selector");

    if (!selector && isOpen() === true) {
      setIsOpen(false);
    }
  };

  const onEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen() === true) {
      setIsOpen(false);
    }
  };

  document.addEventListener("click", onOutsideClick);
  document.addEventListener("keyup", onEscape);

  onCleanup(() => {
    document.removeEventListener("click", onOutsideClick);
    document.removeEventListener("keyup", onEscape);
  });

  return (
    <div class="selector relative border rounded-md mb-4">
      <button
        class="selector__trigger w-full h-full px-4 py-2 flex justify-between items-center"
        type="button"
        onClick={toggleDropdown}
      >
        <span>{props.placeholder ?? "Pasirinkti"}</span>
        <img
          src="/assets/down-chevron.png"
          class={`w-4 h-4 transform transition-transform ${
            isOpen() ? "rotate-180" : ""
          }`}
          alt=""
        />
      </button>
      <div
        class={`${isOpen() ? "block" : "hidden"} flex flex-col absolute ${
          props.openUp ? "bottom-10" : "top-10"
        } bg-white px-5 py-2 w-full h-max-80 rounded-md overflow-y-auto border shadow-sm`}
      >
        <button
          type="button"
          class="inline whitespace-nowrap w-min py-2 text-violet-600 hover:text-violet-700 font-bold"
          onClick={props.onClearAll}
        >
          Išvalyti visus
        </button>
        {props.children}
      </div>
    </div>
  );
};

export default Selector;
