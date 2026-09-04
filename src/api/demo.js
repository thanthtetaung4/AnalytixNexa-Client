/**
 * The seeded demo account (see `scripts/seed_demo.py` in the API repo).
 *
 * Overridable so a deployment can point the demo button at its own account.
 * These are deliberately public credentials for read-and-poke sample data, not
 * a secret.
 */
export const DEMO_CREDENTIALS = {
  email: import.meta.env.VITE_DEMO_EMAIL ?? "demo@analytixnexa.io",
  password: import.meta.env.VITE_DEMO_PASSWORD ?? "demo1234",
};
