import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, For, onMount, Show } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Spinner from "../components/Spinner";
import Tag from "../components/Tag";
import { IDish } from "../models/dish.interface";
import { Supa } from "../supabase/supabase";

const Dish: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = createSignal<IDish>();
  const [categories, setCategories] = createSignal<string[]>([]);

  onMount(async () => {
    const dishId = params.id;

    const { data } = await Supa.client
      .from("dishes")
      .select("*")
      .eq("id", dishId)
      .single();

    setDish(data as IDish);

    const { data: categoriesDto } = await Supa.client
      .from("tags")
      .select("categories (name)")
      .eq("dish_id", dishId);

    const categories: string[] = categoriesDto.map(
      (c: any) => c.categories.name
    );

    setCategories(categories);
  });

  const onDelete = async () => {
    await Supa.client.from("dishes").delete().eq("id", dish().id);
    navigate("/");
  };

  return (
    <Show when={!!dish()} fallback={<Spinner class="min-h-48" />}>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>{dish().name}</Heading>
      <Show when={dish().description}>
        <p class="mb-4 max-h-96 overflow-y-auto">{dish().description}</p>
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
