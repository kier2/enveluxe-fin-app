import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Populate fields from current user
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await api.put("/user/profile", {
        name,
        email,
        password: password || undefined,
        password_confirmation: password ? passwordConfirmation : undefined,
      });

      if (response.data.user) {
        setUser(response.data.user);
      }

      setSuccessMessage("Profile updated successfully!");
      setPassword("");
      setPasswordConfirmation("");
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Failed updating profile:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Profile</h2>
        <p className="text-sm text-gray-500">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center h-fit">
          {/* Avatar with initials */}
          <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-emerald-50">
            {initials}
          </div>
          <h3 className="text-base font-semibold text-gray-900">{user?.name || "—"}</h3>
          <p className="text-sm text-gray-500 mt-1">{user?.email || "—"}</p>
          <div className="mt-4 w-full border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Account Status</p>
            <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Active
            </span>
          </div>
        </div>

        {/* Right: Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Information Section */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Account Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Your email address"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Change Password <span className="text-gray-300 font-normal normal-case">(leave blank to keep current)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={password ? 8 : undefined}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Min. 8 characters"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
