import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Regular client for normal user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "mvp_app_auth_token",
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// -------------------------------
// ADMIN FUNCTIONALITY
// -------------------------------

// Admin client that avoids creating a second auth instance
// The key approach is to create a facade object that creates temporary clients as needed
const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.error("Missing Supabase service role key");
    return null;
  }

  // Create temporary client with a different storage key for admin sessions
  const createTempClient = () => {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: true,
        storageKey: "mvp_admin_auth_token",
        storage: window.localStorage,
        autoRefreshToken: true,
      },
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
