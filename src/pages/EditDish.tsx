import { useLocation, useNavigate } from "@solidjs/router";
import { Component, createEffect, createSignal, For, onMount } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import Heading from "../components/Heading";
import Selector from "../components/Selector";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";
import { CategoryResource } from "../resources/category-resource";
import { DishResource } from "../resources/dish-resource";
import { TagsResource } from "../resources/tags-resource";
import { GeminiResource } from "../resources/gemini-resource";

import QuillEditor from "../components/QuillEditor";
import { handleError } from "../utils/handle-error";
import { isQuillBlank } from "../utils/is-quill-blank";
import { getPluralizedCategoryWord } from "../utils/pluralize";
import toast from "solid-toast";

const EditDish: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = createSignal<ICategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = createSignal<string[]>(
    [],
  );
  const [checked, setChecked] = createSignal<{ [key: string]: boolean }>({});
  const [contents, setContents] = createSignal<object>(null);
  const [dishName, setDishName] = createSignal<string>("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = createSignal(false);
  const [suggestedCategories, setSuggestedCategories] = createSignal<string[]>([]);
  
  let scrollableContentRef: HTMLDivElement | undefined;

  const dish = location.state as IDish;

  onMount(async () => {
    setDishName(dish.name);
    
    const categoryIds = await TagsResource.getDishCategoryIds(dish.id);

    setSelectedCategoryIds(categoryIds);

    const checked = categoryIds.reduce(
      (prev, cur) => ({ ...prev, [cur]: true }),
      {},
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
    const description = isQuillBlank(contents()) ? null : contents();

    try {
      await DishResource.updateDish(dish.id, {
        name,
        description: JSON.stringify(description),
      });

      const tagsPayload = selectedCategoryIds().map((c) => ({
        dishId: dish.id,
        categoryId: c,
      }));

      await TagsResource.deleteDishTags(dish.id);
      await TagsResource.addTags(tagsPayload);

      navigate(`/dishes/${dish.id}`);
    } catch (error) {
      handleError(error);
    }
  };

  const onChange = (e: Event, id: string) => {
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

      // Filter out already selected categories
      const selectedCategoryNames = allCategories
        .filter((c) => selectedCategoryIds().includes(c.id))
        .map((c) => c.name);
      const filteredSuggestions = suggestions.filter(
        (name) => !selectedCategoryNames.includes(name)
      );

      if (filteredSuggestions.length === 0) {
        toast("Visos pasiūlytos kategorijos jau pasirinktos", {
          icon: "✓",
        });
      }

      // Store suggestions as tags (don't auto-apply)
      setSuggestedCategories(filteredSuggestions);
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
      setSelectedCategoryIds((curr) => [...curr, category.id]);
      setChecked((c) => ({ ...c, [category.id]: true }));
    }
    
    // Remove from suggestions after applying
    setSuggestedCategories((curr) => curr.filter((c) => c !== categoryName));
  };

  // Auto-scroll to bottom when suggestions appear
  createEffect(() => {
    const suggestions = suggestedCategories();
    if (suggestions.length > 0 && scrollableContentRef) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollableContentRef?.scrollTo({
          top: scrollableContentRef.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  });

  return (
    <div class="flex flex-col h-full">
      {/* Sticky Header */}
      <div class="flex-shrink-0 mb-6">
        <Backlink class="mb-6">Grįžti</Backlink>
        <Heading>Redaguoti patiekalą</Heading>
      </div>
      
      <form onSubmit={onSubmit} class="flex-1 flex flex-col min-h-0">
        {/* Scrollable Content */}
        <div ref={scrollableContentRef} class="flex-1 overflow-y-auto pr-1">
          <label class="block" for="name">
            Pavadinimas
          </label>
          <TextInput
            id="name"
            placeholder={"Bulviniai blynai"}
            value={dish.name}
            onInput={(e) => setDishName(e.currentTarget.value)}
          ></TextInput>

          <label class="block" for="description">
            Aprašymas
          </label>
          <QuillEditor
            id="description"
            contents={dish.description}
            onContentsChange={onContentsChange}
          ></QuillEditor>

          <label class="block mb-2">Kategorijos</label>
          
          <div class="flex items-start gap-2">
            <div class="flex-1">
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
            </div>
            
            <button
              type="button"
              onClick={getSuggestedCategories}
              disabled={isLoadingSuggestions()}
              class="h-[42px] w-10 flex items-center justify-center rounded-md border border-transparent text-xl hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              title="Pasiūlyti kategorijas su AI"
            >
              {isLoadingSuggestions() ? "⏳" : "🤖"}
            </button>
          </div>

          {suggestedCategories().length > 0 && (
            <div class="mb-4 p-3 bg-violet-50 rounded-md mt-2">
              <p class="text-sm text-violet-900 font-semibold mb-2">AI pasiūlytos kategorijos:</p>
              <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
        </div>
        
        {/* Sticky Footer */}
        <div class="flex-shrink-0 mt-4">
          <Button type="submit" class="w-full">Išsaugoti</Button>
        </div>
      </form>
    </div>
  );
};

export default EditDish;
