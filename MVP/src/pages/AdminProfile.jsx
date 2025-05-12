import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { FiUser, FiMail, FiShield, FiEdit2, FiSave, FiX } from "react-icons/fi";

const AdminProfile = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    contact_number: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate, loading]);

  // Fetch profile data
  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get profile data
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

        if (error) {
          throw error;
        }

        setProfile(data);
        setFormData({
          name: data?.name || "",
          email: user?.email || "",
          role: data?.role || "Administrator",
          contact_number: data?.contact_number || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error.message);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          role: formData.role,
          contact_number: formData.contact_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update profile state
      setProfile({
        ...profile,
        name: formData.name,
        role: formData.role,
        contact_number: formData.contact_number,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError("Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile values
    setFormData({
      name: profile?.name || "",
      email: user?.email || "",
      role: profile?.role || "Administrator",
      contact_number: profile?.contact_number || "",
    });
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Administrator Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md px-3 py-1 text-sm transition duration-150">
              <FiEdit2 className="mr-1" /> Edit
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiSave className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Profile updated successfully!</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-gray-100 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your contact number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShield className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">Name</h3>
                <p className="text-lg font-medium text-gray-900 flex items-center">
                  <FiUser className="mr-2 text-indigo-500" />
                  {profile?.name || "Not set"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">Email</h3>
                <p className="text-lg font-medium text-gray-900 flex items-center">
                  <FiMail className="mr-2 text-indigo-500" />
                  {user?.email}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">Contact Number</h3>
                <p className="text-lg font-medium text-gray-900">{profile?.contact_number || "Not set"}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">Role</h3>
                <p className="text-lg font-medium text-gray-900 flex items-center">
                  <FiShield className="mr-2 text-indigo-500" />
                  {profile?.role || "Administrator"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={signOut}
            className="text-red-600 hover:text-red-800 text-sm font-medium">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
