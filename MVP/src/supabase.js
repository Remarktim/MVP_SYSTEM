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

// Create a single admin client with different auth storage key to avoid conflicts
let _adminClient = null;

const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.error("Missing Supabase service role key");
    return null;
  }

  // Only create the admin client once
  if (!_adminClient) {
    // Use a DIFFERENT storage key for admin to avoid conflicts
    _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        ...sessionOptions,
        storageKey: "mvp_admin_auth_token", // Different key for admin
      },
    });
  }

  return _adminClient;
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
