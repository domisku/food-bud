/* @refresh reload */
import { render } from "solid-js/web";
import "windi.css";

import { Router } from "@solidjs/router";
import App from "./App";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

if ("serviceWorker" in navigator) {
  try {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
  } catch (error) {
    console.error(`Service worker registration failed with ${error}`);
  }
}

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root!
);
