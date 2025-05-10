// src/pages/SubmitIssue.jsx - With hidden search bar in header
import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar"; // Import the Navbar without button
import Header from "../components/layout/Header"; // Import the updated Header component

const SubmitIssue = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [beforeImagePreview, setBeforeImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle image preview
  const handleBeforeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBeforeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeforeImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload image if present
      let beforeImageUrl = null;

      if (beforeImage) {
        const beforeFileName = `${user.id}/${Date.now()}-before.${beforeImage.name.split(".").pop()}`;
        const { data: beforeUploadData, error: beforeUploadError } = await supabase.storage.from("issue-images").upload(beforeFileName, beforeImage);

        if (beforeUploadError) throw beforeUploadError;

        const { data: beforeUrlData } = supabase.storage.from("issue-images").getPublicUrl(beforeFileName);
        beforeImageUrl = beforeUrlData.publicUrl;
      }

      // Create the issue
      const { data, error } = await supabase.from("issues").insert([
        {
          title,
          description,
          location,
          user_id: user.id,
          user_email: user.email,
          status: "Under Review", // Default status
          before_image_url: beforeImageUrl,
          after_image_url: null, // Set after_image_url to null
        },
      ]);

      if (error) throw error;

      // Redirect to dashboard after successful submission
      navigate("/my-issues");
    } catch (error) {
      console.error("Error submitting issue:", error.message);
      setError("Failed to submit issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-14 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Header with search bar hidden */}
      <Header
        title="Submit New Report"
        showSearch={false}
      />

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <p className="mt-1 text-sm text-gray-500">Please provide details about the issue you'd like to report.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Street address or landmark"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block p-2.5 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>
              </div>

              {/* Before Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    {beforeImagePreview ? (
                      <div>
                        <img
                          src={beforeImagePreview}
                          alt="Image preview"
                          className="mx-auto h-64 w-auto object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBeforeImage(null);
                            setBeforeImagePreview(null);
                          }}
                          className="mt-2 text-xs text-red-600 hover:text-red-800">
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true">
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="before-image-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                            <span>Upload an image</span>
                            <input
                              id="before-image-upload"
                              name="before-image-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleBeforeImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  to="/dashboard"
                  className="rounded-xl py-2 px-4 border border-gray-300  text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl py-2 px-4 bg-indigo-600 text-white  hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitIssue;
