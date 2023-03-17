import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, For, onMount, Show } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import QuillReadonly from "../components/QuillReadonly";
import Spinner from "../components/Spinner";
import Tag from "../components/Tag";
import { IDish } from "../models/dish.interface";
import { CategoryResource } from "../supabase/category-resource";
import { DishResource } from "../supabase/dish-resource";
import { handleError } from "../utils/handle-error";

const Dish: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = createSignal<IDish>();
  const [categories, setCategories] = createSignal<string[]>([]);

  onMount(async () => {
    const dishId = params.id;

    const data = await DishResource.getDish(dishId);
    setDish(data);

    const categoryNames = await CategoryResource.getCategoryNames(dishId);
    setCategories(categoryNames);
  });

  const onDelete = async () => {
    try {
      await DishResource.deleteDish(dish().id);

      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Show when={!!dish()} fallback={<Spinner class="min-h-48" />}>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>{dish().name}</Heading>
      <Show when={dish().description}>
        <QuillReadonly contents={dish().description}></QuillReadonly>
      </Show>
      <div class="flex flex-wrap gap-x-2 gap-y-2 mb-4">
        <For each={categories()}>{(category) => <Tag>{category}</Tag>}</For>
      </div>

      <div class="flex flex-col gap-4">
        <Button type="button" onClick={onDelete} variant="secondary">
          Trinti
        </Button>
        <Button
          type="button"
          onClick={() =>
            navigate(`/dishes/edit/${dish().id}`, { state: dish() })
          }
        >
          Redaguoti
        </Button>
      </div>
    </Show>
  );
};

export default Dish;
