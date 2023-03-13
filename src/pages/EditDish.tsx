import { useLocation, useNavigate } from "@solidjs/router";
import { Component, createSignal, For, onMount } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import Selector from "../components/Selector";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";
import { CategoryResource } from "../supabase/category-resource";
import { DishResource } from "../supabase/dish-resource";
import { TagsResource } from "../supabase/tags-resource";

import QuillEditor from "../components/QuillEditor";

const EditDish: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = createSignal<number[]>(
    []
  );
  const [checked, setChecked] = createSignal<{ [key: number]: boolean }>({});
  const [contents, setContents] = createSignal<string>("");

  const dish = location.state as IDish;

  onMount(async () => {
    const categoryIds = await TagsResource.getDishCategoryIds(dish.id);

    setSelectedCategoryIds(categoryIds);

    const checked = categoryIds.reduce(
      (prev, cur) => ({ ...prev, [cur]: true }),
      {}
    );

    setChecked(checked);

    const categories = await CategoryResource.getCategories();

    setCategories(categories as ICategory[]);
  });

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);

    const name = formData.get("name") as string;
    const description = contents();

    await DishResource.updateDish(dish.id, { name, description });

    const tagsPayload = selectedCategoryIds().map((c) => ({
      dish_id: dish.id,
      category_id: c,
    }));

    await TagsResource.deleteDishTags(dish.id);
    await TagsResource.addTags(tagsPayload);

    navigate(`/dishes/${dish.id}`);
  };

  const onChange = (e: Event, id: number) => {
    const target = e.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      setSelectedCategoryIds((ids) => [...ids, id]);
      setChecked((c) => ({ ...c, ...{ [id]: true } }));
      return;
    }

    setSelectedCategoryIds((ids) => ids.filter((filter) => filter !== id));
    setChecked((c) => ({ ...c, ...{ [id]: false } }));
  };

  const onClearAll = () => {
    setSelectedCategoryIds([]);
    setChecked({});
  };

  const onContentsChange = (contents: string) => {
    setContents(contents);
  };

  return (
    <>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Redaguoti patiekalą</Heading>
      <form onSubmit={onSubmit} class="flex flex-col">
        <label class="block" for="name">
          Pavadinimas
        </label>
        <TextInput
          id="name"
          placeholder={"Bulviniai blynai"}
          value={dish.name}
        ></TextInput>

        <label class="block" for="description">
          Aprašymas
        </label>
        <QuillEditor
          id="description"
          contents={dish.description}
          onContentsChange={onContentsChange}
        ></QuillEditor>

        <Selector onClearAll={onClearAll} openUp={true}>
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

        <Button type="submit">Išsaugoti</Button>
      </form>
    </>
  );
};

export default EditDish;
