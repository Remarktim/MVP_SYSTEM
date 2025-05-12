import { useState } from "react";

export default function AdminSettings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {/* Enable notifications toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="notifications"
                className="font-medium text-gray-700">
                Enable notifications
              </label>
              <button
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ease-in-out duration-200 ${notifications ? "bg-indigo-600" : "bg-gray-200"}`}
                onClick={() => setNotifications(!notifications)}>
                <span className="sr-only">Enable notifications</span>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200 ${notifications ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="dark-mode"
                className="font-medium text-gray-700">
                Dark mode
              </label>
              <button
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ease-in-out duration-200 ${darkMode ? "bg-indigo-600" : "bg-gray-200"}`}
                onClick={() => setDarkMode(!darkMode)}>
                <span className="sr-only">Enable dark mode</span>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200 ${darkMode ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Auto-update toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="auto-update"
                className="font-medium text-gray-700">
                Auto-update
              </label>
              <button
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ease-in-out duration-200 ${autoUpdate ? "bg-indigo-600" : "bg-gray-200"}`}
                onClick={() => setAutoUpdate(!autoUpdate)}>
                <span className="sr-only">Enable auto-update</span>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200 ${autoUpdate ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Show tips toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="show-tips"
                className="font-medium text-gray-700">
                Show tips
              </label>
              <button
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ease-in-out duration-200 ${showTips ? "bg-indigo-600" : "bg-gray-200"}`}
                onClick={() => setShowTips(!showTips)}>
                <span className="sr-only">Show tips</span>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200 ${showTips ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="pt-4">
              <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
