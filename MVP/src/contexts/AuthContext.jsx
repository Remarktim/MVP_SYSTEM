import { createContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);

          // Check if user has admin role
          const hasAdminRole = session.user.app_metadata?.role === "admin" || session.user.user_metadata?.role === "admin";
          setIsAdmin(hasAdminRole);

          console.log("User session loaded:", {
            id: session.user.id,
            email: session.user.email,
            isAdmin: hasAdminRole,
            metadata: session.user.user_metadata,
            app_metadata: session.user.app_metadata,
          });
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error getting session:", error.message);
        setError(error.message);
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

        if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
        } else if (session?.user) {
          setUser(session.user);

          // Check if user has admin role in either metadata location
          const hasAdminRole =
            session.user.app_metadata?.role === "admin" ||
            session.user.user_metadata?.role === "admin" ||
            // Also check profiles table for is_admin flag
            (await checkAdminInProfilesTable(session.user.id));

          setIsAdmin(hasAdminRole);

          console.log("Auth state changed:", {
            event,
            user: session.user.email,
            isAdmin: hasAdminRole,
            metadata: session.user.user_metadata,
            app_metadata: session.user.app_metadata,
          });
        }
      } catch (error) {
        console.error("Error in auth state change:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    // Helper function to check admin status in profiles table
    const checkAdminInProfilesTable = async (userId) => {
      try {
        const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();

        if (error) {
          console.error("Error checking admin status in profiles:", error);
          return false;
        }

        return data?.is_admin === true;
      } catch (error) {
        console.error("Error in admin check:", error);
        return false;
      }
    };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error.message);
      setError(error.message);
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
