import { Route, Routes } from "@solidjs/router";
import { Component } from "solid-js";
import { Toaster } from "solid-toast";
import AddCategory from "./pages/AddCategory";
import AddDish from "./pages/AddDish";
import Dish from "./pages/Dish";
import EditDish from "./pages/EditDish";
import Home from "./pages/Home";
import Login from "./pages/Login";

const App: Component = () => {
  return (
    <main>
      <div class="max-w-xl w-xl m-4 bg-light-50 rounded-xl p-10 shadow-2xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-dish" element={<AddDish />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/dishes/:id" element={<Dish />} />
          <Route path="/dishes/edit/:id" element={<EditDish />} />
        </Routes>
      </div>
      <Toaster position="top-center"></Toaster>
    </main>
  );
};

export default App;
