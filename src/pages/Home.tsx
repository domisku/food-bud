import { Link, useNavigate } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import Selector from "../components/Selector";
import Spinner from "../components/Spinner";
import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";
import { Supa } from "../supabase/supabase";
import { checkAuth } from "../utils/check-auth";

const Home: Component = () => {
  checkAuth();

  const [dishes, setDishes] = createSignal<IDish[]>(null);
  const [categories, setCategories] = createSignal<ICategory[]>(null);
  const [filters, setFilters] = createSignal<number[]>([]);
  const [checked, setChecked] = createSignal<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  onMount(async () => {
    const { data: categories } = await Supa.client
      .from("categories")
      .select("*");
    setCategories(categories as ICategory[]);
  });

  createEffect(async () => {
    if (filters().length > 0) {
      const filterIds = filters().join(", ");

      const { data } = await Supa.client
        .rpc("custom", {
          sql: `
      SELECT DISTINCT dishes.id, dishes.name, dishes.description
      FROM tags
      JOIN dishes ON tags.dish_id = dishes.id
      WHERE tags.category_id IN (${filterIds});
      `,
        })
        .order("id");

      setDishes(data);
      return;
    }

    const { data: dishes } = await Supa.client
      .from("dishes")
      .select("id, name")
      .order("id");
    setDishes(dishes as IDish[]);
  });

  const onChange = (e: Event, id: number) => {
    const target = e.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      setFilters((currFilters) => [...currFilters, id]);
      setChecked((c) => ({ ...c, ...{ [id]: true } }));
      return;
    }

    setFilters((currFilters) => currFilters.filter((filter) => filter !== id));
    setChecked((c) => ({ ...c, ...{ [id]: false } }));
  };

  const onClearAll = () => {
    setFilters([]);
    setChecked({});
  };

  return (
    <>
      <Heading>Patiekalai</Heading>
      <Selector
        placeholder="Filtruoti pagal kategoriją"
        onClearAll={onClearAll}
      >
        <For each={categories()}>
          {(category) => (
            <Checkbox
              onChange={(e: any) => onChange(e, category.id)}
              checked={checked()[category.id]}
            >
              {category.name}
            </Checkbox>
          )}
        </For>
      </Selector>
      <div class="h-100 overflow-y-auto mt-4 mb-8">
        <Show when={!!dishes()} fallback={<Spinner />}>
          <For each={dishes()}>
            {(dish) => (
              <Link
                class=" text-black no-underline"
                href={`/dishes/${dish.id}`}
              >
                <div class="hover:bg-gray-50 py-2 px-2 border-b">
                  {dish.name}
                </div>
              </Link>
            )}
          </For>
        </Show>
        {dishes()?.length === 0 && <p>Patiekalų nerasta</p>}
      </div>
      <div class="flex flex-col gap-4">
        <Button onClick={() => navigate("/add-category")} variant="secondary">
          Pridėti kategoriją
        </Button>
        <Button onClick={() => navigate("/add-dish")}>Pridėti patiekalą</Button>
      </div>
    </>
  );
};

export default Home;
