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
  detectSessionInUrl: true,
};

// Create a single shared client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: sessionOptions,
});

// -------------------------------
// ADMIN FUNCTIONALITY
// -------------------------------

/**
 * Get admin client for privileged operations.
 * Returns a function that can be called to perform admin operations.
 * This approach prevents creating multiple client instances.
 *
 * Usage:
 * const { data, error } = await adminSupabase(
 *   (client) => client.from('table').select('*')
 * );
 */
// Create a single admin client instance that can be reused
const createAdminClientOnce = () => {
  let adminClientInstance = null;

  return () => {
    if (!adminClientInstance && supabaseServiceKey) {
      adminClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          ...sessionOptions,
          storageKey: "mvp_admin_auth_token", // Use a different storage key
        },
      });
    }
    return adminClientInstance;
  };
};

const getAdminClient = createAdminClientOnce();

export const adminSupabase = async (callback) => {
  if (!supabaseServiceKey) {
    console.error("Missing Supabase service role key");
    return { data: null, error: new Error("Admin functionality not available") };
  }

  try {
    const adminClient = getAdminClient();
    if (!adminClient) {
      return { data: null, error: new Error("Admin client not available") };
    }

    // Execute the callback with the admin client
    return await callback(adminClient);
  } catch (error) {
    console.error("Admin operation failed:", error);
    return { data: null, error };
  }
};

// Legacy method (deprecated) - will be removed in future version
export const legacyGetAdminClient = () => {
  console.warn("getAdminClient() is deprecated. Use adminSupabase() instead.");
  return null; // Return null to enforce migration to adminSupabase
};

// Helper function for admin operations (backward compatibility)
export const adminQuery = async (callback) => {
  return adminSupabase(callback);
};

// Avoid using deprecated getAdminClient()
// Instead, provide a utility object that uses adminSupabase internally
export const supabaseAdmin = {
  from: (table) => ({
    select: (...args) => adminSupabase((client) => client.from(table).select(...args)),
    insert: (...args) => adminSupabase((client) => client.from(table).insert(...args)),
    update: (...args) => adminSupabase((client) => client.from(table).update(...args)),
    delete: (...args) => adminSupabase((client) => client.from(table).delete(...args)),
  }),
  auth: supabase.auth,
  storage: supabase.storage,
};

// -------------------------------
// LIKES FUNCTIONALITY
// -------------------------------

/**
 * Toggle like status for an issue
 * @param {string} issueId - The ID of the issue to like/unlike
 * @returns {Promise<{ data: { liked: boolean, count: number }, error: any }>}
 */
export const toggleLike = async (issueId) => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: { message: "You must be logged in to like a report" } };
    }

    // Check if the user has already liked this issue
    const { data: existingLike, error: checkError } = await supabase.from("likes").select("id").eq("user_id", user.id).eq("issue_id", issueId).single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected if not liked
      return { data: null, error: checkError };
    }

    let liked = false;

    // If like exists, remove it
    if (existingLike) {
      const { error: deleteError } = await supabase.from("likes").delete().eq("id", existingLike.id);

      if (deleteError) {
        return { data: null, error: deleteError };
      }
    }
    // If like doesn't exist, add it
    else {
      const { error: insertError } = await supabase.from("likes").insert({
        user_id: user.id,
        issue_id: issueId,
      });

      if (insertError) {
        return { data: null, error: insertError };
      }

      liked = true;
    }

    // Get updated like count
    const { data: likeCount, error: countError } = await supabase.from("likes").select("id", { count: "exact" }).eq("issue_id", issueId);

    if (countError) {
      return { data: { liked, count: liked ? 1 : 0 }, error: null };
    }

    return {
      data: {
        liked,
        count: likeCount.length,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { data: null, error };
  }
};

/**
 * Check if the current user has liked an issue
 * @param {string} issueId - The ID of the issue to check
 * @returns {Promise<{ data: { liked: boolean }, error: any }>}
 */
export const getLikeStatus = async (issueId) => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: { liked: false }, error: null };
    }

    // Check if the user has liked this issue
    const { data, error } = await supabase.from("likes").select("id").eq("user_id", user.id).eq("issue_id", issueId).single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      return { data: { liked: false }, error };
    }

    return { data: { liked: !!data }, error: null };
  } catch (error) {
    console.error("Error checking like status:", error);
    return { data: { liked: false }, error };
  }
};

/**
 * Get the like count for an issue
 * @param {string} issueId - The ID of the issue to get likes for
 * @returns {Promise<{ data: { count: number }, error: any }>}
 */
export const getLikeCount = async (issueId) => {
  try {
    // Get like count
    const { data, error, count } = await supabase.from("likes").select("id", { count: "exact" }).eq("issue_id", issueId);

    if (error) {
      return { data: { count: 0 }, error };
    }

    return { data: { count: count || data.length }, error: null };
  } catch (error) {
    console.error("Error getting like count:", error);
    return { data: { count: 0 }, error };
  }
};
