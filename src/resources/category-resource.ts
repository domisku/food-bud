import {
  addDoc,
  collection,
  documentId,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { ICategory } from "../models/category.interface";
import { db } from "./firebase"; // Assuming your firebase.ts exports 'db'

export class CategoryResource {
  private static categoriesCollectionRef = collection(db, "categories");
  private static dishCategoriesCollectionRef = collection(db, "dishCategories"); // We need this to get category names by dishId

  /**
   * Adds one or more categories to Firestore.
   * Uses a batch write for efficiency when adding multiple categories.
   * @param categories An array of partial ICategory objects (without id).
   * @returns A promise that resolves when the categories are added.
   */
  static async addCategory(
    categories: Omit<ICategory, "id">[],
  ): Promise<string[]> {
    const batch = writeBatch(db);
    const addedCategoryIds: string[] = [];

    categories.forEach(async (category) => {
      // For each category, create a new document reference with an auto-generated ID
      const newCategoryRef = collection(db, "categories");
      const docRef = await addDoc(newCategoryRef, category); // This will add the category
      addedCategoryIds.push(docRef.id);
      batch.set(docRef, category); // Add to batch
    });

    await batch.commit(); // Commit all category additions
    return addedCategoryIds; // Return the IDs of the newly added categories
  }

  /**
   * Retrieves all categories from Firestore.
   * @returns A promise that resolves with an array of ICategory objects.
   */
  static async getCategories(): Promise<ICategory[]> {
    const querySnapshot = await getDocs(this.categoriesCollectionRef);

    const categories: ICategory[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as ICategory);
    });

    return categories;
  }

  /**
   * Retrieves the names of categories associated with a specific dish.
   * This involves two queries: first to find associated category IDs, then to get category names.
   * @param dishId The ID of the dish.
   * @returns A promise that resolves with an array of category names.
   */
  static async getCategoryNames(dishId: string): Promise<string[]> {
    // 1. Find all dishCategory documents that link to the given dishId
    const qDishCategories = query(
      this.dishCategoriesCollectionRef,
      where("dishId", "==", dishId),
    );
    const dishCategoriesSnapshot = await getDocs(qDishCategories);

    const categoryIds: string[] = [];
    dishCategoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.categoryId) {
        categoryIds.push(data.categoryId);
      }
    });

    if (categoryIds.length === 0) {
      return []; // No categories associated with this dish
    }

    // Firestore's 'in' operator has a limit of 10 items.
    // If a dish can have more than 10 categories, you'd need to split this into multiple queries.
    if (categoryIds.length > 10) {
      console.warn(
        "Firestore 'in' query supports a maximum of 10 elements. If a dish has more categories, some might be missed.",
      );
      // For a robust solution, you would split categoryIds into chunks of 10
      // perform multiple queries, and merge the results.
    }

    // 2. Fetch the actual category documents using the collected category IDs
    const qCategories = query(
      this.categoriesCollectionRef,
      where(documentId(), "in", categoryIds.slice(0, 10)), // Use slice to respect the 10-item limit for 'in'
    );
    const categoriesSnapshot = await getDocs(qCategories);

    const categoryNames: string[] = [];
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data() as ICategory;
      if (data.name) {
        categoryNames.push(data.name);
      }
    });

    return categoryNames;
  }
}
