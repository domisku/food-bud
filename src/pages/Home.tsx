import { Link, useNavigate } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import toast from "solid-toast";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import Popover from "../components/Popover";
import Spinner from "../components/Spinner";
import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";
import { CategoryResource } from "../resources/category-resource";
import { DishResource } from "../resources/dish-resource";
import { checkAuth } from "../utils/check-auth";

const Home: Component = () => {
  checkAuth();

  const [dishes, setDishes] = createSignal<IDish[]>(null);
  const [categories, setCategories] = createSignal<ICategory[]>(null);
  const [filters, setFilters] = createSignal<number[]>([]);
  const [pendingFilters, setPendingFilters] = createSignal<number[]>([]);
  const [checked, setChecked] = createSignal<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  onMount(async () => {
    const categories = await CategoryResource.getCategories();
    setCategories(categories);
  });

  createEffect(async () => {
    if (filters().length > 0) {
      const data = await DishResource.getFilteredDishes(filters());

      setDishes(data);
      return;
    }

    const dishes = await DishResource.getDishes();

    setDishes(dishes);
  });

  const onChange = (e: Event, id: number) => {
    const target = e.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      setPendingFilters((currFilters) => [...currFilters, id]);
      setChecked((c) => ({ ...c, ...{ [id]: true } }));
      return;
    }

    setPendingFilters((currFilters) => currFilters.filter((filter) => filter !== id));
    setChecked((c) => ({ ...c, ...{ [id]: false } }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters());
  };

  const onClearAll = () => {
    setPendingFilters([]);
    setFilters([]);
    setChecked({});
  };

  const showRandomDishes = (count = 5) => {
    const dishesCount = dishes().length;
    const actualCount = Math.min(count, dishesCount);

    const randomDishIndices = [];

    for (let i = 0; i < actualCount; i++) {
      const num = rollForRandomNumber(dishesCount);

      if (randomDishIndices.includes(num)) {
        i--;
        continue;
      }

      randomDishIndices.push(num);
    }

    const dishNames = randomDishIndices.map((id) => dishes()[id].name);

    toast.custom(
      () => {
        return (
          <div class="bg-white rounded-lg shadow-lg p-4">
            <div class="flex flex-col gap-2">
              <p class="text-lg font-semibold">Atsitiktiniai patiekalai</p>
              <For each={dishNames}>{(dishName) => <p>{dishName}</p>}</For>
              <Button variant="text" onClick={() => toast.dismiss()}>
                Uždaryti
              </Button>
            </div>
          </div>
        );
      },
      { duration: Infinity, unmountDelay: 0 },
    );
  };

  const rollForRandomNumber = (max: number): number => {
    return Math.floor(Math.random() * max);
  };

  return (
    <>
      <div class="flex justify-between items-center mb-4">
        <Heading>Patiekalai</Heading>
        <div class="flex gap-2">
          <Popover
            trigger={
              <img
                class="h-6 w-6"
                src="/assets/filter.svg"
                alt="Filter"
              />
            }
            title="Filtruoti pagal kategoriją"
            onClearAll={onClearAll}
            onClose={applyFilters}
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
          </Popover>
          <button
            class="h-min p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => showRandomDishes()}
            aria-label="Show random dishes"
          >
            <img
              class="h-6 w-6 transform hover:rotate-180 transition-transform"
              src="/assets/dice.svg"
              alt=""
            />
          </button>
        </div>
      </div>
      <div class="overflow-y-auto mt-0 mb-8 max-h-110 min-h-48">
        <Show when={!!dishes()} fallback={<Spinner class="min-h-48" />}>
          <For each={dishes()}>
            {(dish, index) => (
              <Link
                class="text-black no-underline"
                href={`/dishes/${dish.id}`}
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index() * 0.05}s backwards`,
                }}
              >
                <div class="bg-white hover:bg-violet-50 px-4 mb-2 transition-all duration-200 hover:translate-x-1 rounded-md cursor-pointer border border-gray-200 flex items-center min-w-0" style="height: 42px;">
                  <span class="truncate w-full">{dish.name}</span>
                </div>
              </Link>
            )}
          </For>
        </Show>
        {dishes()?.length === 0 && <p>Patiekalų nerasta</p>}
      </div>
      <div class="flex gap-4">
        <Button
          onClick={() => navigate("/categories")}
          variant="secondary"
          class="flex-1"
        >
          Valdyti kategorijas
        </Button>
        <Button onClick={() => navigate("/add-dish")} class="flex-1">
          Pridėti patiekalą
        </Button>
      </div>
    </>
  );
};

export default Home;
