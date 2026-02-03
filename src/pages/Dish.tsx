import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, For, onMount, Show } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import QuillReadonly from "../components/QuillReadonly";
import Spinner from "../components/Spinner";
import Tag from "../components/Tag";
import { IDish } from "../models/dish.interface";
import { CategoryResource } from "../resources/category-resource";
import { DishResource } from "../resources/dish-resource";
import { handleError } from "../utils/handle-error";

const Dish: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = createSignal<IDish>();
  const [categories, setCategories] = createSignal<string[]>([]);
  let dialogRef: HTMLDialogElement;

  onMount(async () => {
    const dishId = params.id;

    const data = await DishResource.getDish(dishId);
    setDish(data);

    const categoryNames = await CategoryResource.getCategoryNames(dishId);
    setCategories(categoryNames);
  });

  const openDeleteDialog = () => {
    dialogRef?.showModal();
  };

  const closeDeleteDialog = () => {
    dialogRef?.close();
  };

  const onDelete = async () => {
    try {
      await DishResource.deleteDish(dish().id);
      closeDeleteDialog();
      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Show when={!!dish()}>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>{dish().name}</Heading>
      <Show when={dish().description}>
        <QuillReadonly contents={dish().description}></QuillReadonly>
      </Show>
      <div class="flex flex-wrap gap-x-2 gap-y-2 mb-4">
        <For each={categories()}>{(category) => <Tag>{category}</Tag>}</For>
      </div>

      <div class="flex gap-4">
        <Button
          type="button"
          onClick={openDeleteDialog}
          variant="secondary"
          class="flex-1"
        >
          Trinti
        </Button>
        <Button
          type="button"
          onClick={() =>
            navigate(`/dishes/edit/${dish().id}`, { state: dish() })
          }
          class="flex-1"
        >
          Redaguoti
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
          Ar tikrai norite ištrinti patiekalą "{dish().name}"? Šio veiksmo
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

export default Dish;
