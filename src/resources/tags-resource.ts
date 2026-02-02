import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "./firebase"; // Assuming your firebase.ts exports 'db'
import { ITag } from "../models/tag.interface";

export class TagsResource {
  private static dishCategoriesCollectionRef = collection(db, "dishCategories");

  /**
   * Adds one or more tags (dishCategory links) to Firestore.
   * Uses a batch write for efficiency and atomicity.
   * @param tags An array of ITag objects, where dishId and categoryId are Firestore document IDs.
   * @returns A promise that resolves when all tags are added.
   */
  static async addTags(tags: ITag[]): Promise<void> {
    const batch = writeBatch(db);

    tags.forEach((tag) => {
      // Create a new document reference with an auto-generated ID for each tag
      const newTagRef = doc(this.dishCategoriesCollectionRef);
      batch.set(newTagRef, {
        dishId: tag.dishId,
        categoryId: tag.categoryId,
      });
    });

    await batch.commit(); // Commit all operations atomically
  }

  /**
   * Retrieves all category IDs associated with a given dish ID.
   * @param dishId The Firestore document ID of the dish.
   * @returns A promise that resolves with an array of category IDs (strings).
   */
  static async getDishCategoryIds(dishId: string): Promise<string[]> {
    const q = query(
      this.dishCategoriesCollectionRef,
      where("dishId", "==", dishId),
    );
    const querySnapshot = await getDocs(q);

    const categoryIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.categoryId) {
        categoryIds.push(data.categoryId);
      }
    });

    return categoryIds;
  }

  /**
   * Deletes all tags (dishCategory links) associated with a given dish ID.
   * Uses a batch write for efficiency and atomicity.
   * @param dishId The Firestore document ID of the dish.
   * @returns A promise that resolves when all associated tags are deleted.
   */
  static async deleteDishTags(dishId: string): Promise<void> {
    const batch = writeBatch(db);

    // Find all dishCategory documents linked to this dishId
    const qTagsToDelete = query(
      this.dishCategoriesCollectionRef,
      where("dishId", "==", dishId),
    );
    const tagSnapshotsToDelete = await getDocs(qTagsToDelete);

    // Add each found tag document to the batch for deletion
    tagSnapshotsToDelete.forEach((tagDoc) => {
      batch.delete(tagDoc.ref);
    });

    await batch.commit(); // Commit all deletions atomically
  }
}
