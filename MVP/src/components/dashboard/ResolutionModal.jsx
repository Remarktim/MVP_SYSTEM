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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Mark Issue as Completed</h3>
          <button
            onClick={closeModal}
            className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-neutral-400 dark:hover:text-neutral-300">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Issue Details</h4>
              <p className="text-sm text-gray-600 dark:text-neutral-400">{selectedIssue.title}</p>
            </div>

            <div>
              <label
                htmlFor="resolutionNotes"
                className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                Resolution Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="resolutionNotes"
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how this issue was resolved..."
                className="py-3 px-4 block w-full border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">After Image (Optional)</label>
              <div className="mt-1 flex justify-center border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 rounded-md dark:border-neutral-700">
                <div className="space-y-2 text-center">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="After image preview"
                        className="mx-auto h-32 w-auto object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAfterImage(null);
                          setImagePreview(null);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-neutral-400 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-neutral-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end space-x-3">
          <button
            onClick={closeModal}
            type="button"
            className="py-2 px-4 inline-flex justify-center items-center rounded-md border border-gray-300 font-medium bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">
            Cancel
          </button>
          <button
            onClick={markAsCompleted}
            disabled={uploadLoading || !resolutionNotes.trim()}
            type="button"
            className="py-2 px-4 inline-flex justify-center items-center rounded-md border border-transparent font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600">
            {uploadLoading ? (
              <span className="flex items-center">
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
              </span>
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
