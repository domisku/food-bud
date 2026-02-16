import { useNavigate } from "@solidjs/router";
import { Component, createSignal, For, onMount } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import QuillEditor from "../components/QuillEditor";
import Selector from "../components/Selector";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { CategoryResource } from "../resources/category-resource";
import { DishResource } from "../resources/dish-resource";
import { GeminiResource } from "../resources/gemini-resource";
import { checkAuth } from "../utils/check-auth";
import { handleError } from "../utils/handle-error";
import { isQuillBlank } from "../utils/is-quill-blank";
import { getPluralizedCategoryWord } from "../utils/pluralize";
import toast from "solid-toast";

const AddDish: Component = () => {
  checkAuth();

  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>(null);
  const [selectedCategories, setSelectedCategories] = createSignal<ICategory[]>(
    [],
  );
  const [checked, setChecked] = createSignal<{ [key: string]: boolean }>({});
  const [contents, setContents] = createSignal<object>(null);
  const [dishName, setDishName] = createSignal<string>("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = createSignal(false);

  onMount(async () => {
    const data = await CategoryResource.getCategories();

    setCategories(data);
  });

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();

    const selectedCategoryIds = selectedCategories().map((c) => c.id);

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const name = formData.get("name") as string;
    const description = isQuillBlank(contents()) ? null : contents();

    try {
      const id = await DishResource.addDish(
        { name, description: JSON.stringify(description) },
        selectedCategoryIds,
      );

      navigate(`/dishes/${id}`);
    } catch (error) {
      handleError(error);
    }
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
      currCategories.filter((c) => c.id !== category.id),
    );
    setChecked((c) => ({ ...c, ...{ [category.id]: false } }));
  };

  const onClearAll = () => {
    setSelectedCategories([]);
    setChecked({});
  };

  const onContentsChange = (contents: object) => {
    setContents(contents);
  };

  const getSuggestedCategories = async () => {
    const name = dishName();
    if (!name || name.trim() === "") {
      toast.error("Įveskite patiekalo pavadinimą");
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const allCategories = categories() || [];
      const categoryNames = allCategories.map((c) => c.name);
      const suggestions = await GeminiResource.suggestCategories(
        name,
        categoryNames,
      );

      if (suggestions.length === 0) {
        toast("Nepavyko rasti tinkamų kategorijų pasiūlymų", {
          icon: "💡",
        });
        return;
      }

      // Auto-select suggested categories
      const suggestedCategories = allCategories.filter((c) =>
        suggestions.includes(c.name),
      );
      
      const newChecked = { ...checked() };
      suggestedCategories.forEach((cat) => {
        newChecked[cat.id] = true;
      });

      setSelectedCategories(suggestedCategories);
      setChecked(newChecked);
      
      const count = suggestions.length;
      toast.success(`Pasiūlyta ${count} ${getPluralizedCategoryWord(count)}`);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Naujas patiekalas</Heading>
      <form onSubmit={submit} class="flex flex-col">
        <label class="block" for="name">
          Pavadinimas
        </label>
        <TextInput
          id="name"
          placeholder={"Bulviniai blynai"}
          onInput={(e) => setDishName(e.currentTarget.value)}
        ></TextInput>
        <label class="block" for="description">
          Aprašymas
        </label>
        <QuillEditor
          id="description"
          onContentsChange={onContentsChange}
        ></QuillEditor>

        <Button
          type="button"
          onClick={getSuggestedCategories}
          disabled={isLoadingSuggestions()}
          class="mb-4"
        >
          {isLoadingSuggestions() ? "Kraunama..." : "🤖 Pasiūlyti kategorijas su AI"}
        </Button>

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
