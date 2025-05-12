import React from "react";

const ResolutionModal = ({
  isOpen,
  closeModal,
  selectedIssue,
  resolutionNotes,
  setResolutionNotes,
  imagePreview,
  handleImageChange,
  setAfterImage,
  setImagePreview,
  markAsCompleted,
  uploadLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between border border-gray-200 items-center border-b p-4">
          <h3 className="text-lg font-medium text-gray-900">Resolve Issue</h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-500">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Issue Details */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Issue ID:</span>
              <span className="ml-2 text-gray-900">{selectedIssue.id}</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedIssue.title}</h4>
            <p className="text-gray-600 text-sm">{selectedIssue.description}</p>

            {/* Before Image (if exists) */}
            {selectedIssue.before_image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Before Image:</p>
                <img
                  src={selectedIssue.before_image}
                  alt="Before"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          <div className="mb-4">
            <label
              htmlFor="resolutionNotes"
              className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Notes
            </label>
            <textarea
              id="resolutionNotes"
              rows="4"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Describe how you resolved the issue..."
            />
          </div>

          {/* After Image Upload */}
          <div className="mb-4">
            <label
              htmlFor="afterImage"
              className="block text-sm font-medium text-gray-700 mb-1">
              After Image (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-48 w-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAfterImage(null);
                        setImagePreview(null);
                      }}
                      className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      Remove
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
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button
            type="button"
            onClick={markAsCompleted}
            disabled={uploadLoading || !resolutionNotes.trim()}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              (uploadLoading || !resolutionNotes.trim()) && "opacity-60 cursor-not-allowed"
            }`}>
            {uploadLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
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
                </svg>
                Processing...
              </>
            ) : (
              "Mark as Completed"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolutionModal;
