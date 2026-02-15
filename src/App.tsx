import { Route, Routes } from "@solidjs/router";
import { Component } from "solid-js";
import { Toaster } from "solid-toast";
import AddCategory from "./pages/AddCategory";
import AddDish from "./pages/AddDish";
import AutoCategorize from "./pages/AutoCategorize";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import Dish from "./pages/Dish";
import EditCategory from "./pages/EditCategory";
import EditDish from "./pages/EditDish";
import Home from "./pages/Home";
import Login from "./pages/Login";

const App: Component = () => {
  return (
    <main class="p-2">
      <div class="max-w-xl w-xl bg-light-50 rounded-xl p-4 md:p-10  shadow-2xl flex flex-col max-h-full max-w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-dish" element={<AddDish />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/auto-categorize" element={<AutoCategorize />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<Category />} />
          <Route path="/categories/edit/:id" element={<EditCategory />} />
          <Route path="/dishes/:id" element={<Dish />} />
          <Route path="/dishes/edit/:id" element={<EditDish />} />
        </Routes>
      </div>
      <Toaster position="top-center"></Toaster>
    </main>
  );
};

export default App;
