// src/pages/Profile.jsx - Enhanced to properly display and edit user name and phone number
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
// eslint-disable-next-line no-unused-vars
import { useNavigate } from "react-router-dom";
import { Pencil, Save, X, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const Profile = () => {
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User profile state
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // Form state while editing
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user profile on component mount
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        console.log("Loading profile for user:", user.id);
        console.log("User auth data:", {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
          app_metadata: user.app_metadata,
        });

        // First get profile data from the profiles table
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile from database:", profileError);
        }

        console.log("Profile data from DB:", profileData);

        // If profile exists in the database, use those values
        if (profileData) {
          const dbProfile = {
            full_name: profileData.name || "",
            email: profileData.email || user.email || "",
            phone: profileData.contact_number || "",
          };

          console.log("Using profile from database:", dbProfile);
          setProfile(dbProfile);
          setFormData({
            full_name: dbProfile.full_name,
            phone: dbProfile.phone,
          });
        } else {
          // If no profile in database, use auth metadata
          const authProfile = {
            full_name: user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: user.user_metadata?.phone || "",
          };

          console.log("No profile in DB, using auth data:", authProfile);
          setProfile(authProfile);
          setFormData({
            full_name: authProfile.full_name,
            phone: authProfile.phone,
          });

          // Create a profile record if it doesn't exist
          console.log("Creating profile record for user:", user.id);
          const { error: createError } = await supabase.from("profiles").insert({
            id: user.id,
            name: authProfile.full_name,
            email: authProfile.email,
            contact_number: authProfile.phone,
            created_at: new Date().toISOString(),
          });

          if (createError) {
            console.error("Error creating profile:", createError);
          } else {
            console.log("Created new profile record successfully");
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("Updating profile with data:", formData);

      // Update the profiles table first
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name: formData.full_name,
        contact_number: formData.phone,
        // Don't overwrite email field
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Error updating profile in database:", profileError);
        throw profileError;
      }

      console.log("Profile updated in database successfully");

      // Also update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (authError) {
        console.error("Error updating auth metadata:", authError);
        throw authError;
      }

      console.log("Auth metadata updated successfully");

      // Update local state
      setProfile({
        ...profile,
        full_name: formData.full_name,
        phone: formData.phone,
      });

      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.");
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSaving(false);
      return;
    }

    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Password updated successfully!");
      setPasswordMode(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error.message);
      setError("Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name,
      phone: profile.phone,
    });
    setEditMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Cancel password change
  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-14 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner">Loading...</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Profile header with avatar */}
            <div className="bg-indigo-600 h-32 sm:h-40"></div>
            <div className="px-4 sm:px-6 lg:px-8 pb-6">
              <div className="-mt-12 sm:-mt-16 flex items-end space-x-5">
                <div className="flex">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white overflow-hidden">
                    <div className="flex items-center justify-center h-full w-full bg-indigo-600 text-white text-3xl sm:text-5xl font-bold">
                      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 truncate">{profile.full_name || "User"}</h2>
                    <p className="text-sm font-medium text-gray-500">{"User"}</p>
                  </div>
                </div>
                {/* Edit button */}
                {!editMode && !passwordMode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Success and Error messages */}
            {successMessage && <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">{successMessage}</div>}

            {error && <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}

            {/* Profile content */}
            <div className="px-4 sm:px-6 lg:px-8 py-5">
              {editMode ? (
                /* Edit Mode */
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <X className="h-4 w-4 inline mr-1" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        <Save className="h-4 w-4 inline mr-1" />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : passwordMode ? (
                /* Password Change Mode */
                <form
                  onSubmit={handlePasswordSubmit}
                  className="max-w-md mx-auto">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Change Password</h3>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="block w-full p-2.5 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long.</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="block w-full p-2.5 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handlePasswordCancel}
                        className="rounded-xl py-2 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 ">
                        <X className="h-4 w-4 inline mr-1" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl py-2 px-4 border border-transparent text-sm font-medium shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        <Save className="h-4 w-4 inline mr-1" />
                        {saving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                    <div className="mt-3 space-y-4">
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{profile.phone || "No phone number added"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Security</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Lock className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Password</span>
                      </div>
                      <button
                        onClick={() => setPasswordMode(true)}
                        className="text-sm text-white rounded-xl py-2 px-4 bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
