import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import TextInput from "../components/TextInput";
import { CategoryResource } from "../supabase/category-resource";
import { checkAuth } from "../utils/check-auth";

const AddCategory: Component = () => {
  checkAuth();

  const navigate = useNavigate();

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const name = formData.get("name") as string;

    await CategoryResource.addCategory([{ name }]);

    navigate("/");
  };

  return (
    <div>
      <Backlink class="mb-6">Grįžti</Backlink>
      <Heading>Nauja kategorija</Heading>
      <form onSubmit={onSubmit} class="flex flex-col">
        <label for="name">Pavadinimas</label>
        <TextInput id="name" placeholder="Vištiena"></TextInput>
        <Button type="submit">Pridėti</Button>
      </form>
    </div>
  );
};

export default AddCategory;
