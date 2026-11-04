// Shim import.meta.env for Supabase client creation in test environment
const env = {
  VITE_SUPABASE_URL: process.env.SUPABASE_URL || "https://test.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || "test-key",
};
try {
  Object.defineProperty(import.meta, "env", { value: env, writable: true, configurable: true });
} catch {
  // import.meta may be frozen; try direct assignment
  try {
    (import.meta as any).env = env;
  } catch {
    // If we can't set import.meta.env, the supabase client will fail to create,
    // but that's OK for tests that don't touch the database
  }
}

process.env.SUPABASE_URL = env.VITE_SUPABASE_URL;
process.env.SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;