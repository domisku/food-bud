import { Component, createSignal, onCleanup, onMount } from "solid-js";

interface IPopoverProps {
  children?: any;
  trigger: any;
  title?: string;
  onClearAll?: () => void;
  onClose?: () => void;
}

const Popover: Component<IPopoverProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const togglePopover = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const closePopover = () => {
    setIsOpen(false);
    if (props.onClose) {
      props.onClose();
    }
  };

  const onOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const popover = target.closest(".popover");

    if (!popover && isOpen() === true) {
      closePopover();
    }
  };

  const onEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen() === true) {
      closePopover();
    }
  };

  onMount(() => {
    document.addEventListener("click", onOutsideClick);
    document.addEventListener("keyup", onEscape);
  });

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
          <div class="flex gap-2 items-center">
            <button
              type="button"
              class="text-sm text-violet-600 hover:text-violet-700 font-bold"
              onClick={props.onClearAll}
            >
              Išvalyti visus
            </button>
            <button
              type="button"
              class="p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={closePopover}
              aria-label="Close"
            >
              <img
                class="h-4 w-4"
                src="/assets/x.svg"
                alt="Close"
              />
            </button>
          </div>
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default Popover;
