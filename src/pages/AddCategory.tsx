import { useNavigate } from "@solidjs/router";
import { Component, createSignal, For, onMount } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { CategoryResource } from "../resources/category-resource";
import { checkAuth } from "../utils/check-auth";
import { handleError } from "../utils/handle-error";

const AddCategory: Component = () => {
  checkAuth();

  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>([]);
  const [categoryToDelete, setCategoryToDelete] = createSignal<ICategory | null>(null);
  let dialogRef: HTMLDialogElement;

  onMount(async () => {
    await loadCategories();
  });

  const loadCategories = async () => {
    try {
      const data = await CategoryResource.getCategories();
      setCategories(data);
    } catch (error) {
      handleError(error);
    }
  };

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const name = formData.get("name") as string;

    try {
      await CategoryResource.addCategory([{ name }]);

      await loadCategories();
      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  const openDeleteDialog = (category: ICategory) => {
    setCategoryToDelete(category);
    dialogRef?.showModal();
  };

  const closeDeleteDialog = () => {
    dialogRef?.close();
    setCategoryToDelete(null);
  };

  const onDelete = async () => {
    const category = categoryToDelete();
    if (!category) return;

    try {
      await CategoryResource.deleteCategory(category.id);
      closeDeleteDialog();
      await loadCategories();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Nauja kategorija</Heading>
      <form onSubmit={onSubmit} class="flex flex-col">
        <label for="name">Pavadinimas</label>
        <TextInput id="name" placeholder="Vištiena"></TextInput>
        <Button type="submit">Pridėti</Button>
      </form>

      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Esamos kategorijos</h2>
        <div class="flex flex-col gap-2">
          <For each={categories()}>
            {(category) => (
              <div class="flex justify-between items-center p-3 border border-gray-300 rounded">
                <span class="font-medium">{category.name}</span>
                <Button
                  type="button"
                  onClick={() => openDeleteDialog(category)}
                  variant="secondary"
                >
                  Trinti
                </Button>
              </div>
            )}
          </For>
        </div>
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
          Ar tikrai norite ištrinti kategoriją "{categoryToDelete()?.name}"?
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
    </div>
  );
};

export default AddCategory;
