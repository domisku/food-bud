import { PostgrestError } from "@supabase/supabase-js";
import toast from "solid-toast";
import getErrorMessage from "./get-error-message";

export function handleError(error: PostgrestError) {
  const message = getErrorMessage(error.code);
  toast.error(message);
}
