// src/pages/Profile.jsx - Enhanced to properly display and edit user name and phone number
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Pencil, Save, X, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const Profile = () => {
  const { user } = useAuth();
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
        console.log("User metadata:", user.user_metadata);

        // Get user metadata from Auth
        const userData = {
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || user.user_metadata?.contact_number || "",
        };

        console.log("Extracted user data:", userData);

        // Check if there's additional profile info in the profiles table
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

        if (error) {
          console.log("Error fetching profile:", error);
          // If it's a "not found" error, that's okay - we'll create it later
          if (error.code !== "PGRST116") {
            throw error;
          }
        }

        console.log("Profile data from DB:", data);

        if (data) {
          // Merge the data, prioritizing the profiles table
          const mergedData = {
            ...userData,
            full_name: data.name || data.full_name || userData.full_name,
            phone: data.contact_number || data.phone || userData.phone,
          };
          console.log("Merged profile data:", mergedData);
          setProfile(mergedData);
          setFormData({
            full_name: mergedData.full_name,
            phone: mergedData.phone,
          });
        } else {
          // If no profile record found, just use the user data
          console.log("No profile found, using auth data");
          setProfile(userData);
          setFormData({
            full_name: userData.full_name,
            phone: userData.phone,
          });
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
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (updateError) {
        console.error("Auth update error:", updateError);
        throw updateError;
      }

      // Let's check the structure of the profiles table first
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*").limit(1);

      if (profilesError) {
        console.error("Error checking profiles:", profilesError);
      }

      // Log the structure to see available columns
      console.log("Profiles table structure:", profilesData);

      // Prepare the update object based on what we know about the structure
      // Using a simpler approach with fewer fields and WITHOUT updated_at
      const updateObject = {
        id: user.id,
      };

      // Add name/full_name field - try to match existing structure
      if (profilesData && profilesData[0] && "name" in profilesData[0]) {
        updateObject.name = formData.full_name;
      } else if (profilesData && profilesData[0] && "full_name" in profilesData[0]) {
        updateObject.full_name = formData.full_name;
      }

      // Add phone/contact_number field - try to match existing structure
      if (profilesData && profilesData[0] && "contact_number" in profilesData[0]) {
        updateObject.contact_number = formData.phone;
      } else if (profilesData && profilesData[0] && "phone" in profilesData[0]) {
        updateObject.phone = formData.phone;
      }

      // Add email if the field exists
      if (profilesData && profilesData[0] && "email" in profilesData[0]) {
        updateObject.email = user.email;
      }

      console.log("Updating profile with:", updateObject);

      // Update the profiles table with the prepared object
      const { error: upsertError } = await supabase.from("profiles").upsert(updateObject);

      if (upsertError) {
        console.error("Profile upsert error:", upsertError);
        throw upsertError;
      }

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
      setError(`Failed to update profile: ${error.message}`);
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
