import { useNavigate } from "@solidjs/router";
import { Supa } from "../supabase/supabase";

export function checkAuth() {
  const navigate = useNavigate();

  if (Supa.session) {
    return;
  }

  Supa.client.auth.getSession().then((res) => {
    const session = res.data?.session;

    if (session) {
      Supa.session = session;
      console.log("Session data saved!");
    } else {
      navigate("/login");
    }
  });
}
