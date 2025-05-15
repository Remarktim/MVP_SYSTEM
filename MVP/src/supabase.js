import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Define consistent session storage options
const sessionOptions = {
  persistSession: true,
  storageKey: "mvp_auth_token", // Use a single consistent key
  storage: localStorage,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

// Regular client for normal user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: sessionOptions,
});

// -------------------------------
// ADMIN FUNCTIONALITY
// -------------------------------

// Admin client that avoids creating a second auth instance
const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.error("Missing Supabase service role key");
    return null;
  }

  // Create temporary client with the SAME storage key for consistent session handling
  const createTempClient = () => {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: sessionOptions, // Use the same session options
    });
  };

  return {
    // Add database operations
    from: (table) => {
      // For database operations, we create a temporary client and immediately use it
      const tempClient = createTempClient();
      return tempClient.from(table);
    },

    // Add storage operations
    storage: {
      from: (bucket) => {
        // For storage operations, we create a temporary client and immediately use it
        const tempClient = createTempClient();
        return tempClient.storage.from(bucket);
      },
    },

    // Add auth operations if needed
    auth: {
      // This approach avoids the GoTrueClient conflict by creating temporary clients
      getUser: async (jwt) => {
        const tempClient = createTempClient();
        return tempClient.auth.getUser(jwt);
      },
      // Add other auth methods as needed
    },
  };
};

// Export the admin client getter function
export const getAdminClient = createAdminClient;

// For backward compatibility with code that imports supabaseAdmin
export const supabaseAdmin = getAdminClient();

// Helper function for admin operations
export const adminQuery = async (callback) => {
  const adminClient = getAdminClient();
  if (!adminClient) {
    throw new Error("Admin client not available");
  }
  return callback(adminClient);
};
