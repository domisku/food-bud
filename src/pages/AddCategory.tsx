import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import Backlink from "../components/Backlink";
import Button from "../components/Button";
import Heading from "../components/Heading";
import TextInput from "../components/TextInput";
import { CategoryResource } from "../resources/category-resource";
import { checkAuth } from "../utils/check-auth";
import { handleError } from "../utils/handle-error";

const AddCategory: Component = () => {
  checkAuth();

  const navigate = useNavigate();

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const name = formData.get("name") as string;

    try {
      await CategoryResource.addCategory([{ name }]);

      navigate("/");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div>
      <Backlink class="mb-6" href="/categories">Grįžti</Backlink>
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
