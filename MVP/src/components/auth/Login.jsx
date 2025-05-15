import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { useAuth } from "../../hooks/useAuth";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { toast } from "react-hot-toast";
import AppLogo from "../logo/AppLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Redirect if already logged in based on admin status
  useEffect(() => {
    if (user) {
      // Check if user is admin and redirect accordingly
      if (isAdmin) {
        // console.log("Admin user detected, redirecting to admin dashboard"); // Keep for debugging if needed
        navigate("/admin");
      } else {
        // console.log("Regular user detected, redirecting to user dashboard"); // Keep for debugging if needed
        // Toast is shown on explicit login, not on initial load/redirect
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsEmailNotConfirmed(false);
    setResendSuccess(false);

    try {
      // console.log("Attempting to sign in with:", email); // Keep for debugging if needed

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        // Renamed error to loginError
        email,
        password,
      });

      if (loginError) {
        // console.error("Login error:", loginError); // Keep for debugging if needed

        // Handle specific error cases
        if (loginError.message.includes("Email not confirmed")) {
          setIsEmailNotConfirmed(true);
          setError("Your email address has not been confirmed. Please check your inbox for a confirmation email or click below to resend it.");
        } else if (loginError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          throw loginError;
        }
        return;
      }

      // console.log("Sign in successful:", data); // Keep for debugging if needed
      // Successful login will trigger the useEffect above due to `user` state change.
      // We show the toast here before that happens.
      if (data.user) {
        // Check if user data is present in the response
        toast.success("Welcome!", { position: "top-center" });
      }
      // Navigation will be handled by the useEffect hook when `user` state updates
    } catch (catchError) {
      // Renamed error to catchError
      console.error("Login exception:", catchError);
      setError(catchError.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setResendingEmail(true);
    setResendSuccess(false);

    try {
      // Send a new confirmation email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      setResendSuccess(true);
      setError(null);
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      setError(error.message || "Failed to resend confirmation email. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center mb-4 sm:mb-6">
          <AppLogo
            width={240}
            height={64}
          />
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">Sign in</h2>

        {error && <div className="mt-4 rounded-md bg-red-50 p-3 sm:p-4 text-sm text-red-700">{error}</div>}

        {resendSuccess && <div className="mt-4 rounded-md bg-green-50 p-3 sm:p-4 text-sm text-green-700">Confirmation email has been resent. Please check your inbox and follow the instructions.</div>}

        {isEmailNotConfirmed && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleResendConfirmationEmail}
              disabled={resendingEmail}
              className="w-full py-2 px-3 sm:px-4 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {resendingEmail ? "Sending..." : "Resend confirmation email"}
            </button>
          </div>
        )}

        <form
          className="mt-8 sm:mt-10 space-y-6"
          onSubmit={handleLogin}>
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Email address</label>
            <div className="relative flex items-center">
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full text-slate-800 text-sm border border-slate-300 px-4 py-3 rounded-md outline-indigo-600"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#bbb"
                stroke="#bbb"
                className="w-4 h-4 absolute right-4"
                viewBox="0 0 24 24">
                <circle
                  cx="10"
                  cy="7"
                  r="6"
                  data-original="#000000"></circle>
                <path
                  d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                  data-original="#000000"></path>
              </svg>
            </div>
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Password</label>
            <div className="relative flex items-center">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full text-slate-800 text-sm border border-slate-300 px-4 py-3 rounded-md outline-indigo-600"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#bbb"
                stroke="#bbb"
                className="w-4 h-4 absolute right-4 cursor-pointer"
                viewBox="0 0 128 128"
                onClick={togglePasswordVisibility}>
                {showPassword ? (
                  // Eye with slash (hidden)
                  <path
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                    data-original="#000000"></path>
                ) : (
                  // Eye (visible)
                  <path
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                    data-original="#000000"></path>
                )}
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 shrink-0 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-3 block text-sm text-slate-800">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-indigo-600 hover:underline font-semibold">
                Forgot your password?
              </button>
            </div>
          </div>

          <div className="!mt-12">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p className="text-slate-800 text-sm !mt-6 text-center">
            Don't have an account?
            <a
              href="/signup"
              className="text-indigo-600 hover:underline ml-1 whitespace-nowrap font-semibold">
              Register here
            </a>
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        initialEmail={email} // Pre-fill with the email from login form if available
      />
    </div>
  );
};

export default Login;
