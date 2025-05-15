import { createContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // Helper function to check admin status in multiple places
  const checkIsAdmin = async (userObject) => {
    if (!userObject) {
      console.log("No user object provided to checkIsAdmin");
      return false;
    }

    try {
      console.log("Checking admin status for user:", userObject.email);

      // Check in app_metadata first (most reliable location)
      if (userObject.app_metadata?.role === "admin") {
        console.log("Admin found in app_metadata");
        return true;
      }

      // Check in user_metadata as fallback
      if (userObject.user_metadata?.role === "admin") {
        console.log("Admin found in user_metadata");
        return true;
      }

      // Log metadata contents for debugging
      console.log("User metadata:", JSON.stringify(userObject.user_metadata));
      console.log("App metadata:", JSON.stringify(userObject.app_metadata));

      try {
        // Check in profiles table as final source
        console.log("Checking admin status in profiles table for user ID:", userObject.id);
        const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userObject.id).single();

        if (error) {
          console.error("Error checking admin status in profiles:", error);
          // Continue execution rather than failing
          return false;
        }

        console.log("Admin status from profiles table:", data?.is_admin);
        return data?.is_admin === true;
      } catch (profileErr) {
        console.error("Exception in profiles check:", profileErr);
        // Don't let profiles check failure block the entire auth flow
        return false;
      }
    } catch (err) {
      console.error("Error in admin check:", err);
      // Return false instead of failing the entire auth flow
      return false;
    }
  };

  // Enhanced function to process user session data consistently
  const processUserSession = async (session) => {
    console.log("Processing user session, session object:", session ? "exists" : "null");

    if (!session?.user) {
      console.log("No valid user in session");
      setUser(null);
      setIsAdmin(false);
      setSessionData(null);
      return null;
    }

    try {
      console.log("Processing session for user:", session.user.email);

      // TEMPORARY: Skip the admin check to fix display issues
      // const adminStatus = await checkIsAdmin(session.user);
      const adminStatus = false; // Temporarily hardcode to false
      console.log("Admin status set to false temporarily");

      // Create consistent session data object
      const userSessionData = {
        id: session.user.id,
        email: session.user.email,
        isAdmin: adminStatus,
        sessionExpiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : "unknown",
      };

      console.log("User session loaded:", userSessionData);

      // Update state
      setUser(session.user);
      setIsAdmin(adminStatus);
      setSessionData(userSessionData);

      return userSessionData;
    } catch (err) {
      console.error("Error processing user session:", err);
      return null;
    }
  };

  // Initialize session from localStorage on mount
  const initializeFromStorage = async () => {
    try {
      console.log("Initializing session from storage");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setError(sessionError.message);
        setUser(null);
        setIsAdmin(false);
        setSessionData(null);
        setLoading(false);
        return;
      }

      console.log("Got session from storage:", session ? "Session exists" : "No session");
      // Process session data consistently
      await processUserSession(session);
    } catch (err) {
      console.error("Error initializing from storage:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize session data on component mount
    initializeFromStorage();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change event:", event);
        console.log("Session in auth state change:", session ? `User: ${session.user?.email}` : "No session");

        if (event === "SIGNED_IN") {
          console.log("SIGNED_IN event detected, session:", session ? "exists" : "null");
          if (session?.user) {
            console.log("User in SIGNED_IN event:", session.user.email);
            const userData = await processUserSession(session);
            console.log("User data processed in SIGNED_IN:", userData);
          } else {
            console.error("SIGNED_IN event but no user in session");
          }
        } else if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setIsAdmin(false);
          setSessionData(null);
        } else if (session?.user) {
          // Process session data using the same function for consistency
          const userData = await processUserSession(session);

          console.log("Auth state changed:", {
            event,
            user: session.user.email,
            isAdmin: userData?.isAdmin,
          });
        }
      } catch (err) {
        console.error("Error in auth state change:", err.message);
        setError(err.message);
      }
    });

    // Add event listener for page refresh/visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Page became visible, refreshing session data");
        initializeFromStorage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription?.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const signOut = async () => {
    try {
      // First check if there's an active session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("No active session found during sign out");
        // Clean up local state even if no active session
        setUser(null);
        setIsAdmin(false);
        setSessionData(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Error signing out:", err.message);
      setError(err.message);

      // Ensure user state is cleared even if there's an error
      setUser(null);
      setIsAdmin(false);
      setSessionData(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    signOut,
    isAdmin,
    sessionData,
    refreshSession: initializeFromStorage,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
