import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { IDish } from "../models/dish.interface";
import { db } from "./firebase"; // Assuming your firebase.ts exports 'db'

export class DishResource {
  private static dishesCollectionRef = collection(db, "dishes");
  private static dishCategoriesCollectionRef = collection(db, "dishCategories");

  static async addDish(
    dish: Omit<IDish, "id">, // id is not passed in, Firestore generates it
    categoryIds: string[], // Assuming categoryIds are now strings
  ): Promise<string> {
    const batch = writeBatch(db);

    // 1. Add the new dish
    const newDishRef = doc(this.dishesCollectionRef); // Create a new document reference with an auto-generated ID
    batch.set(newDishRef, dish); // Set the dish data for the new document

    const insertedDishId = newDishRef.id;

    // 2. Add the dishCategory (tags) for the dish
    categoryIds.forEach((categoryId) => {
      const tagRef = doc(this.dishCategoriesCollectionRef); // Auto-generate ID for the tag document
      batch.set(tagRef, {
        dishId: insertedDishId,
        categoryId: categoryId,
      });
    });

    await batch.commit(); // Commit all operations atomically

    return insertedDishId;
  }

  static async getDish(id: string): Promise<IDish | undefined> {
    const dishDocRef = doc(this.dishesCollectionRef, id);
    const dishSnapshot = await getDoc(dishDocRef);

    if (dishSnapshot.exists()) {
      return { id: dishSnapshot.id, ...dishSnapshot.data() } as IDish;
    } else {
      console.log("No such dish!");
      return undefined;
    }
  }

  static async getDishes(): Promise<IDish[]> {
    const q = query(this.dishesCollectionRef, orderBy("name")); // Order by 'name' as Firestore IDs are not numeric
    const querySnapshot = await getDocs(q);

    const dishes: IDish[] = [];
    querySnapshot.forEach((doc) => {
      dishes.push({ id: doc.id, ...doc.data() } as IDish);
    });

    return dishes;
  }

  static async getFilteredDishes(filters: string[]): Promise<IDish[]> {
    // Firestore's 'in' operator has a limit of 10 items.
    // If 'filters' can be larger than 10, you'd need to split this into multiple queries.
    if (filters.length === 0) {
      return [];
    }
    if (filters.length > 10) {
      console.warn(
        "Firestore 'in' query supports a maximum of 10 elements. Splitting query or reconsidering approach may be necessary.",
      );
      // Implement logic to split into multiple queries and merge results
      // For simplicity, this example will just use the first 10 if more are provided.
      filters = filters.slice(0, 10);
    }

    // 1. Find all dishCategories that match the filter categories
    const qTags = query(
      this.dishCategoriesCollectionRef,
      where("categoryId", "in", filters),
    );
    const tagSnapshots = await getDocs(qTags);

    const dishIds: string[] = [];
    tagSnapshots.forEach((doc) => {
      const data = doc.data();
      if (data.dishId) {
        dishIds.push(data.dishId);
      }
    });

    // Remove duplicates as multiple tags could point to the same dish
    let uniqueDishIds = [...new Set(dishIds)];

    if (uniqueDishIds.length === 0) {
      return [];
    }
    if (uniqueDishIds.length > 10) {
      console.warn(
        "Firestore 'in' query for dish IDs supports a maximum of 10 elements. Splitting query or reconsidering approach may be necessary.",
      );
      uniqueDishIds = uniqueDishIds.slice(0, 10);
    }

    // 2. Fetch the actual dish documents using the collected dish IDs
    const qDishes = query(
      this.dishesCollectionRef,
      where(documentId(), "in", uniqueDishIds),
    );
    const dishSnapshots = await getDocs(qDishes);

    const dishes: IDish[] = [];
    dishSnapshots.forEach((doc) => {
      dishes.push({ id: doc.id, ...doc.data() } as IDish);
    });

    return dishes;
  }

  static async deleteDish(id: string): Promise<void> {
    const batch = writeBatch(db);

    // 1. Delete the dish document itself
    const dishDocRef = doc(this.dishesCollectionRef, id);
    batch.delete(dishDocRef);

    // 2. Find and delete all associated dishCategory (tag) documents
    const qTagsToDelete = query(
      this.dishCategoriesCollectionRef,
      where("dishId", "==", id),
    );
    const tagSnapshotsToDelete = await getDocs(qTagsToDelete);

    tagSnapshotsToDelete.forEach((tagDoc) => {
      batch.delete(tagDoc.ref);
    });

    await batch.commit(); // Commit all deletions atomically
  }

  static async updateDish(
    id: string,
    dish: Partial<Omit<IDish, "id">>, // id should not be updated this way
  ): Promise<void> {
    const dishDocRef = doc(this.dishesCollectionRef, id);
    await updateDoc(dishDocRef, dish);
  }
}
