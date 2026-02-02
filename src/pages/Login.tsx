import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import toast from "solid-toast";
import Button from "../components/Button";
import Heading from "../components/Heading";
import TextInput from "../components/TextInput";
import { AuthResource } from "../resources/auth-resource";

const Login: Component = () => {
  const navigate = useNavigate();

  const login = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const password = formData.get("password") as string;
    const email = import.meta.env.VITE_ROOT_EMAIL;

    try {
      await AuthResource.login(email, password);

      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Heading>Prisijunkite</Heading>
      <form onSubmit={login}>
        <label for="email">Slaptažodis</label>
        <TextInput id="password" type="password"></TextInput>
        <Button type="submit" class="w-full">
          Prisijungti
        </Button>
      </form>
    </>
  );
};

export default Login;
