import { useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";

const termsContent = `
# Terms and Conditions

Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using our website and services.

## 1. Agreement to Terms

By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.

## 2. Account Registration

When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.

You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.

## 3. Intellectual Property

The service and its original content, features, and functionality are and will remain the exclusive property of our company and its licensors. The service is protected by copyright, trademark, and other laws.

## 4. User Conduct

You agree not to use the service:
- In any way that violates any applicable national or international law or regulation
- To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation
- To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity
- In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful

## 5. Termination

We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

Upon termination, your right to use the service will immediately cease.

## 6. Limitation of Liability

In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.

## 7. Governing Law

These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.

## 8. Changes to Terms

We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
`;

const privacyContent = `
# Privacy Policy

This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of our services.

## 1. Information We Collect

### 1.1 Information You Provide to Us

- Account Information: When you register for an account, we collect your name, email address, and contact number.
- Communications: When you communicate with us, we collect information you provide in relation to that communication.

### 1.2 Information We Automatically Collect

- Usage Information: We collect information about your interactions with our platform, such as the pages or content you view, and other actions on our services.
- Device Information: We collect information about the devices you use to access our services, including hardware and software information.
- Log Data: Our servers automatically record information including your IP address, access times, and pages requested.

## 2. How We Use Information

We use the information we collect for the following purposes:

- Provide, maintain, and improve our services
- Communicate with you about products, services, promotions, and events
- Provide customer support and respond to your requests
- Personalize your experience with our services
- Monitor and analyze trends, usage, and activities
- Detect, investigate, and prevent fraudulent transactions and other illegal activities
- Comply with our legal obligations

## 3. Information Sharing and Disclosure

We may share your information with:

- Service Providers: We work with third-party service providers to perform services on our behalf.
- Legal Requirements: We may disclose your information if required to do so by law or in response to valid requests by public authorities.
- Business Transfers: If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.

## 4. Data Retention

We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.

## 5. Security

We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your information.

## 6. Your Rights

Depending on your location, you may have certain rights regarding your personal information, such as:

- Access to your personal information
- Correction of inaccurate information
- Deletion of your personal information
- Restriction of processing of your personal information
- Data portability
- Objection to processing of your personal information

## 7. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
`;

const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/70">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto markdown-content">
          <div className="prose prose-sm max-w-none">
            {content.split("\n").map((line, index) => {
              if (line.startsWith("# ")) {
                return (
                  <h1
                    key={index}
                    className="text-2xl font-bold mt-4 mb-2">
                    {line.substring(2)}
                  </h1>
                );
              } else if (line.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className="text-xl font-bold mt-4 mb-2">
                    {line.substring(3)}
                  </h2>
                );
              } else if (line.startsWith("### ")) {
                return (
                  <h3
                    key={index}
                    className="text-lg font-bold mt-3 mb-1">
                    {line.substring(4)}
                  </h3>
                );
              } else if (line.startsWith("- ")) {
                return (
                  <li
                    key={index}
                    className="ml-4">
                    {line.substring(2)}
                  </li>
                );
              } else if (line.trim() === "") {
                return <br key={index} />;
              } else {
                return (
                  <p
                    key={index}
                    className="mb-2">
                    {line}
                  </p>
                );
              }
            })}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200/70 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      setEmailError(null);
    }
  };

  const checkEmailExists = async (email) => {
    if (!email || !email.includes("@")) return;

    setIsCheckingEmail(true);
    setEmailError(null);

    try {
      console.log("Checking email:", email);

      const { data, error } = await supabase.from("profiles").select("email").eq("email", email.trim()).limit(1);

      if (error) {
        console.error("Error checking email:", error);
      } else {
        console.log("Profiles check result:", data);
      }

      if (data && data.length > 0) {
        setEmailError("This email is already registered. Please use a different email or login to your existing account.");
        setIsCheckingEmail(false);
        return;
      }

      try {
        const tempPassword = "TEMP_" + Math.random().toString(36).substring(2);

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: email,
          password: tempPassword,
        });

        if (signupError) {
          // If there's an explicit error about existing user
          if (signupError.message === "User already registered") {
            setEmailError("This email is already registered. Please use a different email or login to your existing account.");
          }
        } else if (signupData?.user) {
          console.log("Signup check response:", signupData.user);

          // Check the identities array - if empty, email exists
          if (signupData.user.identities && signupData.user.identities.length === 0) {
            setEmailError("This email is already registered. Please use a different email or login to your existing account.");
          }
        }
      } catch (signupCheckError) {
        console.error("Error checking via signup:", signupCheckError);
      }
    } catch (error) {
      console.error("Error in email check:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Check if terms are accepted
    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions to create an account");
      setLoading(false);
      return;
    }

    try {
      // Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            contact_number: formData.contactNumber,
          },
        },
      });

      // Handle auth signup errors - explicit error check
      if (error) {
        if (error.message === "User already registered") {
          setError("This email is already registered. Please use a different email or login to your existing account.");
          setLoading(false);
          return;
        }
        throw error;
      }

      // Check if the user object has empty identities array - this indicates an existing user
      if (data?.user?.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please use a different email or login to your existing account.");
        setLoading(false);
        return;
      }

      // Successful signup, insert profile data
      if (data?.user?.id) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          contact_number: formData.contactNumber,
        });

        if (profileError) {
          console.error("Error inserting profile:", profileError);
        }
      }

      setSuccess(true);

      // Redirect to login after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setShowPrivacyModal(true);
  };

  return (
    <div className="bg-gray-50">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-md w-full">
          <div className="w-40 mb-8 mx-auto block">
            <h1 className="text-2xl font-bold text-indigo-600 text-center">Community Connect MVP</h1>
          </div>

          <div className="p-8 rounded-2xl bg-white shadow">
            <h2 className="text-slate-900 text-center text-3xl font-semibold">Create Account</h2>

            {error && <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {success && <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">Registration successful! Please check your email for confirmation. Redirecting to login...</div>}

            <form
              className="mt-8 space-y-6"
              onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">Full Name</label>
                  <div className="relative flex items-center">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full text-slate-800 text-sm border border-slate-300 px-4 py-3 rounded-md outline-indigo-600"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
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
                        r="6"></circle>
                      <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5z"></path>
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">Email Address</label>
                  <div className="relative flex items-center">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`w-full text-slate-800 text-sm border ${emailError ? "border-red-500" : "border-slate-300"} px-4 py-3 rounded-md outline-indigo-600`}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => checkEmailExists(formData.email)}
                    />
                    {isCheckingEmail ? (
                      <svg
                        className="animate-spin h-5 w-5 absolute right-4 text-indigo-600"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#bbb"
                        stroke="#bbb"
                        className="w-4 h-4 absolute right-4"
                        viewBox="0 0 24 24">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"></path>
                      </svg>
                    )}
                  </div>
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                </div>

                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">Contact Number</label>
                  <div className="relative flex items-center">
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      required
                      className="w-full text-slate-800 text-sm border border-slate-300 px-4 py-3 rounded-md outline-indigo-600"
                      placeholder="Enter your contact number"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#bbb"
                      stroke="#bbb"
                      className="w-4 h-4 absolute right-4"
                      viewBox="0 0 24 24">
                      <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"></path>
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
                      autoComplete="new-password"
                      required
                      className="w-full text-slate-800 text-sm border border-slate-300 px-4 py-3 rounded-md outline-indigo-600"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-4"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 text-sm font-medium mb-2 block">Confirm Password</label>
                  <div className="relative flex items-center">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="w-full text-slate-800 text-sm border border-slate-300 px-4 py-3 rounded-md outline-indigo-600"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-4"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="text-slate-800">
                      I agree to the{" "}
                      <button
                        onClick={openTermsModal}
                        className="text-indigo-600 hover:underline font-medium">
                        Terms and Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        onClick={openPrivacyModal}
                        className="text-indigo-600 hover:underline font-medium">
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="!mt-8">
                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="w-full py-3 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-indigo-400">
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>

              <p className="text-slate-800 text-sm !mt-6 text-center">
                Already have an account?
                <a
                  href="/login"
                  className="text-indigo-600 hover:underline ml-1 whitespace-nowrap font-semibold">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms and Conditions"
        content={termsContent}
      />

      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        content={privacyContent}
      />
    </div>
  );
};

export default Signup;
