import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { ITag } from "../models/tag.interface";
import { Supa } from "./supabase";

export class TagsResource {
  static async addTags(tags: ITag[]): Promise<PostgrestSingleResponse<null>> {
    return Supa.client.from("tags").insert(tags).throwOnError();
  }

  static async getDishCategoryIds(id: number): Promise<number[]> {
    const { data } = await Supa.client
      .from("tags")
      .select("category_id")
      .eq("dish_id", id)
      .throwOnError();

    const categoryIds = data.map((d) => d.category_id);

    return categoryIds;
  }

  static async deleteDishTags(
    id: number
  ): Promise<PostgrestSingleResponse<null>> {
    return await Supa.client
      .from("tags")
      .delete()
      .eq("dish_id", id)
      .throwOnError();
  }
}
