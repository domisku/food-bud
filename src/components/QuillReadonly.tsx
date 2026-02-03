import Quill from "quill";
import { Component, createEffect, createSignal, onMount } from "solid-js";

interface IQuillReadonlyProps {
  contents?: string;
}

const QuillReadonly: Component<IQuillReadonlyProps> = (props) => {
  const [quill, setQuill] = createSignal(null);

  onMount(() => {
    const quillEditor = new Quill(".quill-readonly", {
      readOnly: true,
      theme: "snow",
      modules: { toolbar: false },
    });

    setQuill(quillEditor);
  });

  createEffect(() => {
    quill().setContents(JSON.parse(props.contents));
  });

  return (
    <div class="quill-readonly mb-4 max-h-100 min-h-48 overflow-y-auto"></div>
  );
};

export default QuillReadonly;
