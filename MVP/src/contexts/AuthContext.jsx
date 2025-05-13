import { createContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper function to check admin status in multiple places
  const checkIsAdmin = async (userObject) => {
    if (!userObject) return false;

    try {
      // Check in app_metadata first (most reliable location)
      if (userObject.app_metadata?.role === "admin") {
        return true;
      }

      // Check in user_metadata as fallback
      if (userObject.user_metadata?.role === "admin") {
        return true;
      }

      // Check in profiles table as final source
      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userObject.id).single();

      if (error) {
        console.error("Error checking admin status in profiles:", error);
        return false;
      }

      return data?.is_admin === true;
    } catch (err) {
      console.error("Error in admin check:", err);
      return false;
    }
  };

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const adminStatus = await checkIsAdmin(session.user);
          setIsAdmin(adminStatus);

          console.log("User session loaded:", {
            id: session.user.id,
            email: session.user.email,
            isAdmin: adminStatus,
          });
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error getting session:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change event:", event);

        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setIsAdmin(false);
        } else if (session?.user) {
          setUser(session.user);
          const adminStatus = await checkIsAdmin(session.user);
          setIsAdmin(adminStatus);

          console.log("Auth state changed:", {
            event,
            user: session.user.email,
            isAdmin: adminStatus,
          });
        }
      } catch (err) {
        console.error("Error in auth state change:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Error signing out:", err.message);
      setError(err.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
