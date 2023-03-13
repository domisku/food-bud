import Quill from "quill";
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

interface IQuillEditorProps {
  contents?: string;
  onContentsChange?: Function;
  id?: string;
}

const QuillEditor: Component<IQuillEditorProps> = (props) => {
  const [quill, setQuill] = createSignal(null);

  const onTextChange = () => {
    props.onContentsChange(quill().getContents());
  };

  onMount(() => {
    setQuill(
      new Quill(".quill-editor", {
        theme: "snow",
        placeholder:
          "Papildoma informacija apie patiekalą (pvz.: receptas, komentarai ir t.t.)",
        modules: {
          toolbar: [
            "bold",
            "italic",
            "underline",
            { list: "ordered" },
            { list: "bullet" },
          ],
        },
      })
    );

    quill().on("text-change", onTextChange);
  });

  onCleanup(() => {
    quill().off("text-change", onTextChange);
    setQuill(null);
  });

  createEffect(() => {
    quill().setContents(JSON.parse(props.contents));
  });

  return (
    <div class="mt-2">
      <div
        class="quill-editor min-h-48 mb-4 max-h-100 overflow-y-auto"
        role="textbox"
        id={props.id}
      ></div>
    </div>
  );
};

export default QuillEditor;
