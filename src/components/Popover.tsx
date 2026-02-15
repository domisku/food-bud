import { Component, createSignal, onCleanup } from "solid-js";

interface IPopoverProps {
  children?: any;
  trigger: any;
  title?: string;
  onClearAll?: () => void;
}

const Popover: Component<IPopoverProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const togglePopover = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const onOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const popover = target.closest(".popover");

    if (!popover && isOpen() === true) {
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
    <div class="popover relative">
      <button
        class="popover__trigger p-2 rounded-md hover:bg-gray-100 transition-colors"
        type="button"
        onClick={togglePopover}
        aria-label="Filter"
      >
        {props.trigger}
      </button>
      <div
        class={`${isOpen() ? "block" : "hidden"} flex flex-col absolute right-0 top-12 bg-white px-5 py-3 w-72 max-h-96 rounded-md overflow-y-auto border shadow-lg z-50`}
      >
        <div class="flex justify-between items-center mb-2 pb-2 border-b">
          <span class="font-semibold text-lg">{props.title ?? "Filter"}</span>
          <button
            type="button"
            class="text-sm text-violet-600 hover:text-violet-700 font-bold"
            onClick={props.onClearAll}
          >
            Išvalyti visus
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default Popover;
