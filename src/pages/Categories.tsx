import { Link, useNavigate } from "@solidjs/router";
import { Component, createSignal, For, onMount, Show } from "solid-js";
import toast from "solid-toast";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Spinner from "../components/Spinner";
import { ICategory } from "../models/category.interface";
import { CategoryResource } from "../resources/category-resource";
import { handleError } from "../utils/handle-error";
import { checkAuth } from "../utils/check-auth";

const Categories: Component = () => {
  checkAuth();

  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [categoryToDelete, setCategoryToDelete] = createSignal<ICategory | null>(null);
  let dialogRef: HTMLDialogElement | undefined;

  onMount(async () => {
    await loadCategories();
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryResource.getCategories();
      setCategories(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (category: ICategory) => {
    setCategoryToDelete(category);
    dialogRef?.showModal();
  };

  const closeDeleteDialog = () => {
    setCategoryToDelete(null);
    dialogRef?.close();
  };

  const onDelete = async () => {
    try {
      const category = categoryToDelete();
      if (!category) return;

      await CategoryResource.deleteCategory(category.id);
      closeDeleteDialog();
      toast.success("Kategorija ištrinta");
      await loadCategories();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Kategorijos</Heading>

      <div class="overflow-y-auto mt-4 mb-8 max-h-110 min-h-48">
        <Show when={!loading()} fallback={<Spinner class="min-h-48" />}>
          <For each={categories()}>
            {(category, index) => (
              <div
                class="bg-white px-4 mb-2 rounded-md border border-gray-200 flex items-center justify-between min-w-0"
                style={{
                  height: "42px",
                  animation: `fadeInUp 0.3s ease-out ${index() * 0.05}s backwards`,
                }}
              >
                <span class="truncate flex-1">{category.name}</span>
                <button
                  type="button"
                  onClick={() => openDeleteDialog(category)}
                  class="text-red-600 hover:text-red-700 text-sm px-3 py-1 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Trinti ${category.name}`}
                >
                  Trinti
                </button>
              </div>
            )}
          </For>
          {categories().length === 0 && <p>Kategorijų nerasta</p>}
        </Show>
      </div>

      <div class="flex gap-4">
        <Button
          onClick={() => navigate("/add-category")}
          class="flex-1"
        >
          Pridėti kategoriją
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
          Ar tikrai norite ištrinti kategoriją "{categoryToDelete()?.name}"? Šio veiksmo
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
    </>
  );
};

export default Categories;
