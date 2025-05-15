import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { getCurrentAdmin } from "../../utils/adminAuth";
import { toast } from "react-hot-toast";
import { Pencil, Save, X, Mail, Phone, Briefcase, Building } from "lucide-react";

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const adminUser = getCurrentAdmin();

        if (!adminUser) {
          toast.error("Admin authentication required");
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("id", adminUser.id).single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        const initialProfile = {
          full_name: adminUser.user_metadata?.full_name || "",
          email: adminUser.email || "",
          phone: adminUser.user_metadata?.phone || "",
          role: adminUser.user_metadata?.role || "Administrator",
        };

        if (profileData) {
          const dbProfile = {
            full_name: profileData.name || initialProfile.full_name,
            email: profileData.email || initialProfile.email,
            phone: profileData.contact_number || initialProfile.phone,
            role: profileData.role || initialProfile.role,
          };
          setAdmin(dbProfile);
          setFormData(dbProfile);
        } else {
          setAdmin(initialProfile);
          setFormData(initialProfile);

          const { error: insertError } = await supabase.from("profiles").insert({
            id: adminUser.id,
            name: initialProfile.full_name,
            email: initialProfile.email,
            contact_number: initialProfile.phone,
            role: initialProfile.role,
            is_admin: true,
            created_at: new Date().toISOString(),
          });

          if (insertError) throw insertError;
          toast.success("Admin profile created in database.");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(`Error loading profile: ${err.message}`);
        toast.error(`Error loading profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(admin);
    setEditMode(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const adminUser = getCurrentAdmin();
      if (!adminUser) {
        toast.error("Admin authentication required");
        setError("Admin authentication required.");
        setUpdating(false);
        return;
      }

      const updates = {
        name: formData.full_name,
        contact_number: formData.phone,
      };

      const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (Object.keys(filteredUpdates).length === 0) {
        toast.info("No changes to save.");
        setUpdating(false);
        setEditMode(false);
        return;
      }

      const { error: updateError } = await supabase.from("profiles").update(filteredUpdates).eq("id", adminUser.id);

      if (updateError) throw updateError;

      setAdmin((prevAdmin) => ({ ...prevAdmin, full_name: formData.full_name, phone: formData.phone }));
      setFormData((prevForm) => ({ ...prevForm, full_name: formData.full_name, phone: formData.phone }));
      setSuccessMessage("Profile updated successfully!");
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(`Error updating profile: ${err.message}`);
      toast.error(`Error updating profile: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pb-14 md:pb-0">
        <div className="text-center py-10">
          <div className="spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 pb-14 md:pb-0 flex flex-col items-center">
      <main className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-indigo-600 h-32 sm:h-40"></div>
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="-mt-12 sm:-mt-16 flex items-end space-x-5">
              <div className="flex">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white overflow-hidden">
                  <div className="flex items-center justify-center h-full w-full bg-indigo-600 text-white text-3xl sm:text-5xl font-bold">
                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : "A"}
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 truncate">{formData.full_name || "Admin User"}</h2>
                  <p className="text-sm font-medium text-gray-500">{formData.role || "Administrator"}</p>
                </div>
              </div>
              {!editMode && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Pencil className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {successMessage && <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">{successMessage}</div>}
          {error && <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}

          <div className="px-4 sm:px-6 lg:px-8 py-5">
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="full_name"
                      className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Role is assigned and cannot be changed here.</p>
                  </div>
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
                      disabled={updating}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                      <Save className="h-4 w-4 inline mr-1" />
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Admin Information</h3>
                  <div className="mt-3 space-y-4">
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{formData.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{formData.phone || "No phone number added"}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{formData.role || "No role specified"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
