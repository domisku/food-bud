import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";
import { Supa } from "./supabase";
import { TagsResource } from "./tags-resource";

export class DishResource {
  static async addDish(
    dish: Partial<IDish>,
    categoryIds: ICategory["id"][]
  ): Promise<PostgrestSingleResponse<null>> {
    const { data } = await Supa.client
      .from("dishes")
      .insert([dish])
      .select("id");

    const insertedDishId = data[0].id;

    const tagsPayload = categoryIds.map((c) => ({
      dish_id: insertedDishId,
      category_id: c,
    }));

    return await TagsResource.addTags(tagsPayload);
  }

  static async getDish(id: string): Promise<IDish> {
    const { data } = await Supa.client
      .from("dishes")
      .select("*")
      .eq("id", id)
      .single<IDish>();

    return data;
  }

  static async getDishes(): Promise<IDish[]> {
    const { data } = await Supa.client
      .from("dishes")
      .select<string, IDish>("id, name")
      .order("id");

    return data;
  }

  static async getFilteredDishes(filters: number[]): Promise<IDish[]> {
    const filterIds = filters.join(", ");

    const { data } = await Supa.client
      .rpc("custom", {
        sql: `
      SELECT DISTINCT dishes.id, dishes.name, dishes.description
      FROM tags
      JOIN dishes ON tags.dish_id = dishes.id
      WHERE tags.category_id IN (${filterIds});
      `,
      })
      .order("id");

    return data;
  }

  static async deleteDish(id: number): Promise<PostgrestSingleResponse<null>> {
    await TagsResource.deleteDishTags(id);

    return await Supa.client.from("dishes").delete().eq("id", id);
  }

  static async updateDish(
    id: number,
    dish: Partial<IDish>
  ): Promise<PostgrestSingleResponse<null>> {
    return await Supa.client.from("dishes").update(dish).eq("id", id);
  }
}