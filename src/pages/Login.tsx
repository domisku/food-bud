import { useNavigate } from "@solidjs/router";
import { Component, createSignal, onMount } from "solid-js";
import toast from "solid-toast";
import Button from "../components/Button";
import Heading from "../components/Heading";
import TextInput from "../components/TextInput";
import Checkbox from "../components/Checkbox";
import { AuthResource } from "../supabase/auth-resource";
import { Supa } from "../supabase/supabase";

const Login: Component = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = createSignal(false);

  onMount(async () => {
    const token = localStorage.getItem("fb_remember_token");
    if (!token) return;

    try {
      const { data, error } = await Supa.client.auth.setSession({
        refresh_token: token,
      });

      if (error) {
        localStorage.removeItem("fb_remember_token");
        return;
      }

      if (data?.session) {
        Supa.session = data.session;
        navigate("/");
      }
    } catch (err) {
      localStorage.removeItem("fb_remember_token");
      console.error("Auto-login failed", err);
    }
  });

  const login = async (e: SubmitEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const password = formData.get("password") as string;
    const email = import.meta.env.VITE_ROOT_EMAIL;

    try {
      const response = await AuthResource.login(email, password);
      const session = (response as any)?.data?.session;

      if (session) {
        Supa.session = session;
      }

      if (remember()) {
        const refreshToken = session?.refresh_token;
        if (refreshToken) {
          localStorage.setItem("fb_remember_token", refreshToken);
        }
      } else {
        localStorage.removeItem("fb_remember_token");
      }

      navigate("/");
    } catch (error: any) {
      toast.error(error?.message || "Įvyko klaida");
    }
  };

  return (
    <> 
      <Heading>Prisijunkite</Heading>
      <form onSubmit={login}> 
        <label for="email">Slaptažodis</label> 
        <TextInput id="password" type="password"></TextInput> 

        <div class="flex items-center mb-4"> 
          <Checkbox
            checked={remember()}
            onChange={(e: any) => setRemember(e.target?.checked ?? !remember())}
          >
            Prisiminti mane
          </Checkbox>
        </div>

        <Button type="submit" class="w-full"> 
          Prisijungti 
        </Button>
      </form>
    </>
  );
};

export default Login;