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
        class={`${isOpen() ? "block" : "hidden"} flex flex-col absolute right-0 top-12 bg-white w-72 max-h-96 rounded-md overflow-y-auto border shadow-lg z-50`}
      >
        <div class="sticky top-0 bg-white flex justify-between items-center gap-4 px-5 py-3 pb-2 border-b z-10">
          <span class="font-semibold text-lg">{props.title ?? "Filter"}</span>
          <button
            type="button"
            class="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            onClick={closePopover}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="px-5 py-3">
          {props.children}
        </div>
        <div class="sticky bottom-0 bg-white px-5 py-3 pt-2 border-t">
          <button
            type="button"
            class="w-full text-sm text-violet-600 hover:text-violet-700 font-bold py-2"
            onClick={props.onClearAll}
          >
            Išvalyti visus
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popover;
