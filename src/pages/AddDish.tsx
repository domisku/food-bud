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
  const [suggestedCategories, setSuggestedCategories] = createSignal<string[]>([]);

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
        setSuggestedCategories([]);
        return;
      }

      // Store suggestions as tags (don't auto-apply)
      setSuggestedCategories(suggestions);
      const count = suggestions.length;
      toast.success(`Pasiūlyta ${count} ${getPluralizedCategoryWord(count)}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        handleError(error);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applySuggestedCategory = (categoryName: string) => {
    const allCategories = categories() || [];
    const category = allCategories.find((c) => c.name === categoryName);
    
    if (category && !checked()[category.id]) {
      setSelectedCategories((curr) => [...curr, category]);
      setChecked((c) => ({ ...c, [category.id]: true }));
    }
    
    // Remove from suggestions after applying
    setSuggestedCategories((curr) => curr.filter((c) => c !== categoryName));
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

        <label class="block mb-2">Kategorijos</label>
        
        <div class="flex items-start gap-2 mb-4">
          <div class="flex-1">
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
          </div>
          
          <button
            type="button"
            onClick={getSuggestedCategories}
            disabled={isLoadingSuggestions()}
            class="rounded-md p-2 text-2xl hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Pasiūlyti kategorijas su AI"
          >
            {isLoadingSuggestions() ? "⏳" : "🤖"}
          </button>
        </div>

        {suggestedCategories().length > 0 && (
          <div class="mb-4 p-3 bg-violet-50 rounded-md">
            <p class="text-sm text-violet-900 font-semibold mb-2">AI pasiūlytos kategorijos:</p>
            <div class="flex flex-wrap gap-2">
              <For each={suggestedCategories()}>
                {(categoryName) => (
                  <button
                    type="button"
                    onClick={() => applySuggestedCategory(categoryName)}
                    class="px-3 py-1 bg-white border border-violet-300 rounded-full text-sm text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-colors"
                  >
                    {categoryName}
                  </button>
                )}
              </For>
            </div>
          </div>
        )}

        <Button type="submit">Pridėti</Button>
      </form>
    </>
  );
};

export default AddDish;
