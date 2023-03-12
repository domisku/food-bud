import { useNavigate } from "@solidjs/router";
import { Component, createSignal, For, onMount } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import Selector from "../components/Selector";
import TextArea from "../components/TextArea";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { Supa } from "../supabase/supabase";
import { checkAuth } from "../utils/check-auth";

const AddDish: Component = () => {
  checkAuth();

  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>(null);
  const [selectedCategories, setSelectedCategories] = createSignal<ICategory[]>(
    []
  );
  const [checked, setChecked] = createSignal<{ [key: number]: boolean }>({});

  onMount(async () => {
    const { data } = await Supa.client.from("categories").select("*");

    setCategories(data as ICategory[]);
  });

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();

    const selectedCategoryIds = selectedCategories().map((c) => c.id);

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);

    const name = formData.get("name");
    const description = formData.get("description");

    const { data } = await Supa.client
      .from("dishes")
      .insert([{ name, description }])
      .select("id");

    const insertedDishId = data[0].id;

    const tagsPayload = selectedCategoryIds.map((c) => ({
      dish_id: insertedDishId,
      category_id: c,
    }));

    await Supa.client.from("tags").insert(tagsPayload);

    navigate("/");
  };

  const onChange = (e: Event, category: ICategory) => {
    const target = e.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      setSelectedCategories((currCategories) => [...currCategories, category]);
      setChecked((c) => ({ ...c, ...{ [category.id]: true } }));

      return;
    }

    setSelectedCategories((currCategories) =>
      currCategories.filter((c) => c.id !== category.id)
    );
    setChecked((c) => ({ ...c, ...{ [category.id]: false } }));
  };

  const onClearAll = () => {
    setSelectedCategories([]);
    setChecked({});
  };

  return (
    <>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Naujas patiekalas</Heading>
      <form onSubmit={submit} class="flex flex-col">
        <label class="block" for="name">
          Pavadinimas
        </label>
        <TextInput id="name" placeholder={"Bulviniai blynai"}></TextInput>
        <label class="block" for="description">
          Aprašymas
        </label>
        <TextArea
          id="description"
          placeholder={
            "Papildoma informacija apie patiekalą (pvz.: receptas, komentarai ir t.t.)"
          }
        ></TextArea>

        <Selector
          placeholder="Pasirinkite kategorijas"
          openUp={true}
          onClearAll={onClearAll}
        >
          <For each={categories()}>
            {(category) => (
              <Checkbox
                onChange={(e) => onChange(e, category)}
                checked={checked()[category.id]}
              >
                {category.name}
              </Checkbox>
            )}
          </For>
        </Selector>

        <Button type="submit">Pridėti</Button>
      </form>
    </>
  );
};

export default AddDish;
