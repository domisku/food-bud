import { createClient, Session } from "@supabase/supabase-js";

export class Supa {
  static readonly client = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
  );
  private static _session: Session = null;

  static get session() {
    return this._session;
  }

  static set session(value: Session) {
    this._session = value;
  }
}
