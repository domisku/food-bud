import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import Button from "../components/Button";
import Heading from "../components/Heading";
import TextInput from "../components/TextInput";
import { Supa } from "../supabase/supabase";

const Login: Component = () => {
  const navigate = useNavigate();

  const logIn = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const password = formData.get("password") as string;
    const email = import.meta.env.VITE_ROOT_EMAIL;

    await Supa.client.auth.signInWithPassword({
      email,
      password,
    });

    navigate("/");
  };

  return (
    <>
      <Heading>Prisijunkite</Heading>
      <form onSubmit={logIn}>
        <label for="email">Slaptažodis</label>
        <TextInput id="password" type="password"></TextInput>
        <Button type="submit">Prisijungti</Button>
      </form>
    </>
  );
};

export default Login;
