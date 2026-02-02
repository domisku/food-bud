import { signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "./firebase";

export class AuthResource {
  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("User signed in:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  }
}
