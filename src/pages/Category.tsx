import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, onMount, Show } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Spinner from "../components/Spinner";
import { ICategory } from "../models/category.interface";
import { CategoryResource } from "../resources/category-resource";
import { handleError } from "../utils/handle-error";

const Category: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = createSignal<ICategory>();
  let dialogRef: HTMLDialogElement | undefined;

  onMount(async () => {
    try {
      const categoryId = params.id;
      const data = await CategoryResource.getCategory(categoryId);
      setCategory(data);
    } catch (error) {
      handleError(error);
      navigate("/");
    }
  });

  const openDeleteDialog = () => {
    dialogRef?.showModal();
  };

  const closeDeleteDialog = () => {
    dialogRef?.close();
  };

  const onDelete = async () => {
    try {
      const cat = category();
      if (!cat) return;
      
      await CategoryResource.deleteCategory(cat.id);
      closeDeleteDialog();
      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Show when={!!category()} fallback={<Spinner />}>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>{category().name}</Heading>

      <div class="flex gap-4 mt-6">
        <Button
          type="button"
          onClick={openDeleteDialog}
          variant="secondary"
          class="flex-1"
        >
          Trinti
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        class="p-6 rounded-lg shadow-xl backdrop:bg-black backdrop:opacity-50 backdrop:backdrop-blur-sm max-w-md"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Patvirtinti trynimą</h2>
          <button
            type="button"
            onClick={closeDeleteDialog}
            class="text-gray-500 hover:text-gray-700 text-3xl leading-none p-2 -m-2 self-start"
            aria-label="Uždaryti"
          >
            ×
          </button>
        </div>
        <p class="mb-6">
          Ar tikrai norite ištrinti kategoriją "{category().name}"? Šio veiksmo
          negalima bus atšaukti.
        </p>
        <div class="flex gap-4 w-full">
          <Button
            type="button"
            onClick={closeDeleteDialog}
            variant="secondary"
            class="flex-1"
          >
            Atšaukti
          </Button>
          <Button type="button" onClick={onDelete} class="flex-1">
            Trinti
          </Button>
        </div>
      </dialog>
    </Show>
  );
};

export default Category;
