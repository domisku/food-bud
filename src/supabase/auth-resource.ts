import { AuthResponse } from "@supabase/supabase-js";
import { Supa } from "./supabase";

export class AuthResource {
  static async login(email: string, password: string): Promise<AuthResponse> {
    return await Supa.client.auth.signInWithPassword({
      email,
      password,
    });
  }
}
