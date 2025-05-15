import { supabase } from "../supabase";

// Admin auth state management
let adminUser = null;
let adminListeners = [];
let lastAdminActivityTime = Date.now();
let adminInactivityTimer = null;

const ADMIN_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Function to handle admin activity
const handleAdminActivity = () => {
  lastAdminActivityTime = Date.now();
  // console.log("Admin activity detected, resetting timer."); // Optional: for debugging
  resetAdminInactivityTimer();
};

// Function to reset the inactivity timer
const resetAdminInactivityTimer = () => {
  if (adminInactivityTimer) {
    clearTimeout(adminInactivityTimer);
  }
  // Only set the timer if an admin is actually logged in
  if (adminUser) {
    adminInactivityTimer = setTimeout(() => {
      if (adminUser && Date.now() - lastAdminActivityTime >= ADMIN_INACTIVITY_TIMEOUT) {
        console.log("Admin inactive for 30 minutes, signing out.");
        adminSignOut();
      }
    }, ADMIN_INACTIVITY_TIMEOUT);
  }
};

// Add/remove event listeners for admin activity
const setupAdminActivityListeners = () => {
  window.addEventListener("mousemove", handleAdminActivity);
  window.addEventListener("keydown", handleAdminActivity);
  window.addEventListener("click", handleAdminActivity);
  window.addEventListener("scroll", handleAdminActivity);
  // console.log("Admin activity listeners added."); // Optional: for debugging
};

const removeAdminActivityListeners = () => {
  window.removeEventListener("mousemove", handleAdminActivity);
  window.removeEventListener("keydown", handleAdminActivity);
  window.removeEventListener("click", handleAdminActivity);
  window.removeEventListener("scroll", handleAdminActivity);
  if (adminInactivityTimer) {
    clearTimeout(adminInactivityTimer);
    adminInactivityTimer = null;
  }
  // console.log("Admin activity listeners removed."); // Optional: for debugging
};

// Notify all listeners when admin state changes
const notifyListeners = () => {
  adminListeners.forEach((listener) => listener(adminUser));
};

// Subscribe to admin auth changes
export const onAdminAuthChange = (callback) => {
  adminListeners.push(callback);
  callback(adminUser); // Initial call with current state
  return () => {
    adminListeners = adminListeners.filter((listener) => listener !== callback);
  };
};

// Admin login function
export const adminLogin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is an admin
    if (!data.user) throw new Error("No user returned from login");

    const isAdmin = await verifyAdmin(data.user);
    if (!isAdmin) {
      // Sign out if not an admin
      await supabase.auth.signOut();
      throw new Error("Access denied: Not an admin account");
    }

    // Store admin user in local storage and memory
    adminUser = {
      ...data.user,
      isAdmin: true,
      sessionExpiresAt: data.session.expires_at,
    };
    localStorage.setItem("adminUser", JSON.stringify(adminUser));
    notifyListeners();
    lastAdminActivityTime = Date.now(); // Reset activity time on login
    setupAdminActivityListeners(); // Start listening for activity
    resetAdminInactivityTimer(); // Start inactivity timer

    return { user: adminUser };
  } catch (error) {
    console.error("Admin login error:", error);
    return { error };
  }
};

// Sign out admin
export const adminSignOut = async () => {
  try {
    // Clear local storage and memory
    localStorage.removeItem("adminUser");
    adminUser = null;
    notifyListeners();
    removeAdminActivityListeners(); // Stop listening for activity and clear timer

    // Sign out from Supabase too
    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    console.error("Admin sign out error:", error);
    return { error };
  }
};

// Check if user is admin through different methods
const verifyAdmin = async (user) => {
  // Method 1: Check app_metadata
  if (user.app_metadata?.role === "admin") {
    return true;
  }

  // Method 2: Check user_metadata
  if (user.user_metadata?.role === "admin") {
    return true;
  }

  // Method 3: Check in profiles table
  try {
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.is_admin === true;
  } catch (err) {
    console.error("Exception in admin verification:", err);
    return false;
  }
};

// Get current admin user
export const getCurrentAdmin = () => {
  if (adminUser) return adminUser;

  // Try to get from local storage
  const storedAdmin = localStorage.getItem("adminUser");
  if (storedAdmin) {
    try {
      adminUser = JSON.parse(storedAdmin);
      // Check if session is expired
      if (adminUser.sessionExpiresAt) {
        const expiresAt = new Date(adminUser.sessionExpiresAt * 1000);
        if (expiresAt < new Date()) {
          // Session expired, clear it
          localStorage.removeItem("adminUser");
          adminUser = null;
        }
      }
      return adminUser;
    } catch (e) {
      localStorage.removeItem("adminUser");
      return null;
    }
  }

  return null;
};

// Initialize admin from localStorage
export const initializeAdmin = async () => {
  const storedAdmin = localStorage.getItem("adminUser");
  if (!storedAdmin) {
    removeAdminActivityListeners(); // Ensure listeners are off if no admin
    return null;
  }

  try {
    // Validate session is still active with Supabase
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      localStorage.removeItem("adminUser");
      adminUser = null;
      notifyListeners();
      removeAdminActivityListeners(); // Clean up
      return null;
    }

    // Verify this is still an admin
    const isAdmin = await verifyAdmin(data.session.user);
    if (!isAdmin) {
      localStorage.removeItem("adminUser");
      adminUser = null;
      notifyListeners();
      removeAdminActivityListeners(); // Clean up
      return null;
    }

    // Update admin user
    adminUser = {
      ...data.session.user,
      isAdmin: true,
      sessionExpiresAt: data.session.expires_at,
    };
    localStorage.setItem("adminUser", JSON.stringify(adminUser));
    notifyListeners();
    lastAdminActivityTime = Date.now(); // Reset activity time on init
    setupAdminActivityListeners(); // Start listening for activity
    resetAdminInactivityTimer(); // Start inactivity timer

    return adminUser;
  } catch (e) {
    console.error("Error initializing admin:", e);
    localStorage.removeItem("adminUser");
    adminUser = null;
    notifyListeners();
    removeAdminActivityListeners(); // Clean up on error
    return null;
  }
};

// Initial check when module loads
// If an admin session is found in local storage and validated, start monitoring.
initializeAdmin().then((currentAdmin) => {
  if (currentAdmin) {
    console.log("Admin session initialized on load, starting inactivity monitoring.");
  } else {
    // console.log("No active admin session on load."); // Optional: for debugging
    removeAdminActivityListeners(); // Ensure listeners are off if no admin
  }
});

// Check if the current user is an admin
export const isAdminLoggedIn = () => {
  return adminUser !== null;
};
