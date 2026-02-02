import { useNavigate } from "@solidjs/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../resources/firebase";

export async function checkAuth() {
  const navigate = useNavigate();

  if (await getCurrentUserOnce()) {
    return;
  }

  navigate("/login");
}

function getCurrentUserOnce(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe immediately after the first call
      resolve(user);
    });
  });
}
