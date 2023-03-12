import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ICategory } from "../models/category.interface";
import { Supa } from "./supabase";

export class CategoryResource {
  static async addCategory(
    categories: Partial<ICategory>[]
  ): Promise<PostgrestSingleResponse<unknown>> {
    return Supa.client.from("categories").insert(categories);
  }

  static async getCategories(): Promise<ICategory[]> {
    const { data } = await Supa.client
      .from("categories")
      .select<string, ICategory>("*");

    return data;
  }

  static async getCategoryNames(dishId: string): Promise<ICategory["name"][]> {
    const { data } = await Supa.client
      .from("tags")
      .select("categories (name)")
      .eq("dish_id", dishId);

    const categories: string[] = data.map((c: any) => c.categories.name);

    return categories;
  }
}
