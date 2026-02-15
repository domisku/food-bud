import { useNavigate, useParams } from "@solidjs/router";
import { Component, createSignal, onMount, Show } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import Spinner from "../components/Spinner";
import TextInput from "../components/TextInput";
import { ICategory } from "../models/category.interface";
import { CategoryResource } from "../resources/category-resource";
import { checkAuth } from "../utils/check-auth";
import { handleError } from "../utils/handle-error";

const EditCategory: Component = () => {
  checkAuth();

  const params = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = createSignal<ICategory>();

  onMount(async () => {
    try {
      const categoryId = params.id;
      const data = await CategoryResource.getCategory(categoryId);
      setCategory(data);
    } catch (error) {
      handleError(error);
      navigate("/");
    }
  });

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const name = formData.get("name") as string;

    try {
      const cat = category();
      if (!cat) return;

      await CategoryResource.updateCategory(cat.id, { name });

      navigate(`/categories/${cat.id}`);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Show when={!!category()} fallback={<Spinner />}>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Redaguoti kategoriją</Heading>
      <form onSubmit={onSubmit} class="flex flex-col">
        <label for="name">Pavadinimas</label>
        <TextInput id="name" placeholder="Vištiena" value={category().name}></TextInput>
        <Button type="submit">Išsaugoti</Button>
      </form>
    </Show>
  );
};

export default EditCategory;
