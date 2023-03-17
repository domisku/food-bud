import { AuthResponse } from "@supabase/supabase-js";
import { Supa } from "./supabase";

export class AuthResource {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await Supa.client.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      throw new Error("Neteisingas slaptažodis");
    }

    return response;
  }
}
