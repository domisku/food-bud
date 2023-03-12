import { useLocation, useNavigate } from "@solidjs/router";
import { Component, createSignal, For, onMount } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import Selector from "../components/Selector";
import TextArea from "../components/TextArea";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";
import { Supa } from "../supabase/supabase";

const EditDish: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = createSignal<number[]>(
    []
  );
  const [checked, setChecked] = createSignal<{ [key: number]: boolean }>({});

  const dish = location.state as IDish;

  onMount(async () => {
    const { data } = await Supa.client
      .from("tags")
      .select("category_id")
      .eq("dish_id", dish.id);

    const categoryIds = data.map((d) => d.category_id);

    setSelectedCategoryIds(categoryIds);

    const checked = categoryIds.reduce(
      (prev, cur) => ({ ...prev, [cur]: true }),
      {}
    );

    setChecked(checked);

    const { data: categories } = await Supa.client
      .from("categories")
      .select("*");

    setCategories(categories as ICategory[]);
  });

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);

    const name = formData.get("name");
    const description = formData.get("description");

    await Supa.client
      .from("dishes")
      .update({ name, description })
      .eq("id", dish.id);

    const tagsPayload = selectedCategoryIds().map((c) => ({
      dish_id: dish.id,
      category_id: c,
    }));

    await Supa.client.from("tags").delete().eq("dish_id", dish.id);

    await Supa.client.from("tags").insert(tagsPayload);

    navigate("/");
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
        <TextArea
          id="description"
          placeholder={
            "Papildoma informacija apie patiekalą (pvz.: receptas, komentarai ir t.t.)"
          }
          value={dish.description}
        ></TextArea>
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
