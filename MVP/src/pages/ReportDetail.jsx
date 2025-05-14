import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUpload, FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import { supabase, getAdminClient } from "../supabase";
import { useAuth } from "../hooks/useAuth";

// Rejection Modal Component
const RejectionModal = ({ isOpen, onClose, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Report</h3>

        <p className="text-gray-600 mb-6">Are you sure you want to reject this report?</p>

        <div className="mt-5 sm:mt-6 flex justify-end z-[1510] space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Cancel
          </button>
          <button
            type="button"
            onClick={onReject}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Reject Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, message, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-up relative">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
          <FiCheck className="h-6 w-6 text-green-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title || "Success!"}</h3>

        <p className="text-center text-gray-600 mb-5">{message}</p>

        <div className="mt-5 sm:mt-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center items-center w-full sm:w-40 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transform hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successTitle, setSuccessTitle] = useState("");

  // Log auth state on component mount
  useEffect(() => {
    console.log("Auth state:", user ? "Authenticated" : "Not authenticated");
    console.log("User ID:", user?.id);
  }, [user]);

  // Fetch report data
  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        console.log("Fetching report ID:", id);

        // Fetch the issue details
        const { data: issueData, error: issueError } = await supabase.from("issues").select("*").eq("id", id).single();

        if (issueError) {
          console.error("Error fetching issue:", issueError);
          throw issueError;
        }

        console.log("Issue data retrieved:", issueData);

        // Fetch user profile data if we have a user_id
        let userData = null;
        if (issueData.user_id) {
          // Query the profiles table directly
          const { data: profileData, error: profileError } = await supabase.from("profiles").select("name, email, contact_number, role").eq("id", issueData.user_id).single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else if (profileData) {
            console.log("Profile data retrieved:", profileData);
            userData = profileData;
          }
        }

        // Combine the data
        const reportData = {
          ...issueData,
          user_name: userData?.name || "Anonymous",
          user_email: userData?.email || null,
          contact_number: userData?.contact_number || null,
          user_role: userData?.role || null,
        };

        console.log("Combined report data:", reportData);

        setTimeout(() => {
          setReport(reportData);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError("Failed to load report details");
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  // Handle file change for after image
  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file (type, size, etc)
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or GIF image.");
      return;
    }

    if (file.size > maxSize) {
      setError("Image must be less than 5MB.");
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setAfterImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setAfterImage(file);
    setError(null);
  };

  // Handle accepting a report
  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);

    try {
      console.log("Accepting report with ID:", id);

      // Use a more direct update approach
      const admin = getAdminClient();
      if (!admin) {
        throw new Error("Admin client not available");
      }

      const { error } = await admin
        .from("issues")
        .update({
          status: "In Progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error accepting report:", error);
        throw error;
      }

      console.log("Report successfully updated to In Progress");

      // Update local state
      setReport({
        ...report,
        status: "In Progress",
        updated_at: new Date().toISOString(),
      });

      setSubmitting(false);

      // Show success notification with modal instead of alert
      setSuccessTitle("Report Accepted");
      setSuccessMessage("The report has been accepted and is now In Progress.");
      setSuccessModalOpen(true);

      // We'll navigate after the modal is closed
    } catch (error) {
      console.error("Error accepting report:", error);
      setError(`Failed to accept report: ${error.message}`);
      setSubmitting(false);
    }
  };

  // Handle rejecting a report
  const handleReject = async () => {
    setSubmitting(true);
    setError(null);

    try {
      console.log("Rejecting report with ID:", id);

      // Use a more direct update approach
      const admin = getAdminClient();
      if (!admin) {
        throw new Error("Admin client not available");
      }

      const { error } = await admin
        .from("issues")
        .update({
          status: "Rejected",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error rejecting report:", error);
        throw error;
      }

      console.log("Report successfully updated to Rejected");

      // Update local state
      setReport({
        ...report,
        status: "Rejected",
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSubmitting(false);

      // Show success notification with modal
      setSuccessTitle("Report Rejected");
      setSuccessMessage("The report has been rejected successfully.");
      setSuccessModalOpen(true);

      // We'll navigate after the modal is closed
    } catch (error) {
      console.error("Error rejecting report:", error);
      setError(`Failed to reject report: ${error.message}`);
      setSubmitting(false);
    }
  };

  // Handle marking the report as completed
  const handleComplete = async () => {
    if (!afterImage) {
      setError("Please upload an 'after' image before completing the report");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log("Completing report with ID:", id);

      // Get admin client - Use a try/catch specifically for this step
      let admin;
      try {
        admin = getAdminClient();
        if (!admin) {
          throw new Error("Admin client not available");
        }
      } catch (adminError) {
        console.error("Error getting admin client:", adminError);
        // Fall back to regular supabase client on the user side
        admin = supabase;
      }

      // First upload the after image to storage
      const file = afterImage;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `after-images/${id}/${fileName}`;

      console.log("Uploading after image:", filePath);

      // Upload to Supabase Storage - Handle different client structures
      const { error: uploadError } = await (admin.storage ? admin.storage.from("issue-images").upload(filePath, file) : admin.from("storage").from("issue-images").upload(filePath, file));

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      // Get public URL for the uploaded image - Handle different client structures
      const { data: urlData } = admin.storage ? admin.storage.from("issue-images").getPublicUrl(filePath) : admin.from("storage").from("issue-images").getPublicUrl(filePath);

      const afterImageUrl = urlData?.publicUrl;

      console.log("Image uploaded successfully, URL:", afterImageUrl);

      // Update the report
      const { error } = await admin
        .from("issues")
        .update({
          status: "Completed",
          after_image_path: afterImageUrl,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error completing report:", error);
        throw error;
      }

      console.log("Report successfully updated to Completed");

      // Update local state
      setReport({
        ...report,
        status: "Completed",
        after_image_path: afterImageUrl,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSubmitting(false);

      // Show success notification with modal
      setSuccessTitle("Report Completed");
      setSuccessMessage("The report has been marked as completed successfully.");
      setSuccessModalOpen(true);

      // We'll navigate after the modal is closed
    } catch (error) {
      console.error("Error completing report:", error);
      setError(`Failed to complete report: ${error.message}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-start">
            <FiAlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/issues")}
          className="flex items-center text-indigo-600 hover:text-indigo-800">
          <FiArrowLeft className="mr-1" /> Back to Issues
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <FiAlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Report not found</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/issues")}
          className="flex items-center text-indigo-600 hover:text-indigo-800">
          <FiArrowLeft className="mr-1" /> Back to Issues
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/admin/issues")}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
        <FiArrowLeft className="mr-1" /> Back to Issues
      </button>

      {/* Error messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-start">
            <FiAlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setError(null)}>
              <span className="text-xl">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Report header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{report.title}</h1>
              <div className="flex items-center">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === "Under Review"
                      ? "bg-blue-100 text-blue-800"
                      : report.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : report.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : report.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {report.status}
                </span>
                <span className="ml-2 text-sm text-gray-500 border border-gray-200 rounded-full px-2">{report.category}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mt-1">Reported: {new Date(report.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-2">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line break-words leading-relaxed max-h-[300px] overflow-y-auto pr-2">{report.description}</p>
          </div>

          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Location</h2>
            <p className="text-sm text-gray-600">{report.location || "Not specified"}</p>
          </div>

          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-700 mb-1">Reported By</h2>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                {report.user_name ? report.user_name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{report.user_name || "Anonymous"}</p>

                {report.user_email && <p className="text-xs text-gray-500">✉️ {report.user_email}</p>}

                {report.contact_number && <p className="text-xs text-gray-500">📞 {report.contact_number}</p>}

                {report.user_role && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800">{report.user_role}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Accept/Reject buttons for Under Review reports */}
          {report.status === "Under Review" && (
            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(true)}
                disabled={submitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  submitting && "opacity-50 cursor-not-allowed"
                }`}>
                <FiX className="mr-2 -ml-1 h-4 w-4" />
                Reject Report
              </button>
              <button
                onClick={handleAccept}
                disabled={submitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  submitting && "opacity-50 cursor-not-allowed"
                }`}>
                {submitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 text-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2 -ml-1 h-4 w-4" />
                    Accept Report
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Before image section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-800">Before Image</h2>
        </div>
        <div className="p-6">
          {report.before_image_path ? (
            <div className="relative">
              <img
                src={report.before_image_path}
                alt="Before"
                className="w-full rounded-lg"
              />
              <span className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">Before</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300">
              <div className="text-center">
                <FiAlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">No before image available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion section - Only show for In Progress reports */}
      {report.status === "In Progress" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-800">Complete Report</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                After Image <span className="text-red-500">*</span>
              </label>

              {afterImagePreview ? (
                <div className="relative mt-1">
                  <img
                    src={afterImagePreview}
                    alt="After preview"
                    className="w-full h-auto rounded-lg"
                  />
                  <span className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">After</span>
                  <button
                    onClick={() => {
                      setAfterImage(null);
                      setAfterImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700">
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="after-image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload an after image</span>
                        <input
                          id="after-image-upload"
                          name="after-image"
                          type="file"
                          className="sr-only"
                          onChange={handleAfterImageChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting || !afterImage}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (submitting || !afterImage) && "opacity-50 cursor-not-allowed"
                }`}>
                {submitting ? (
                  <>
                    <div
                      className="animate-spin mr-2 h-4 w-4 text-white"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2 -ml-1 h-4 w-4" />
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* After image section - Only show for Completed reports */}
      {report.status === "Completed" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-800">After Image</h2>
          </div>
          <div className="p-6">
            {report.after_image_path ? (
              <div className="relative">
                <img
                  src={report.after_image_path}
                  alt="After"
                  className="w-full rounded-lg"
                />
                <span className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">After</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                <div className="text-center">
                  <FiAlertTriangle className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-500">No after image available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReject={handleReject}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          navigate("/admin/issues");
        }}
        message={successMessage}
        title={successTitle}
      />
    </div>
  );
}
