"use client";

import { useState } from "react";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Status = "idle" | "loading" | "success" | "error";

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (pwd.length === 0) return 0;
  if (pwd.length < 8) return 1;
  if (pwd.length < 12) return 2;
  return 3;
}

const strengthLabel = ["", "Weak", "Fair", "Strong"];
const strengthColour = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];
const strengthText = ["", "text-red-500", "text-yellow-600", "text-green-600"];

const emptyForm: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (form.fullName.trim().length === 0) {
      setErrorMessage("Full name is required.");
      setStatus("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Something went wrong.");
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setStatus("idle");
    setErrorMessage("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const strength = passwordStrength(form.password);
  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mb-3 text-3xl">✓</div>
        <p className="text-xl font-bold text-green-800">Account created!</p>
        <p className="mt-2 text-sm text-green-700">
          Your account has been created successfully.
        </p>
        <a
          href="/login"
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Sign in to your account
        </a>
        <button
          onClick={handleReset}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          Register another account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Full name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full name <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          minLength={1}
          value={form.fullName}
          onChange={handleChange}
          placeholder="Jane Smith"
          aria-describedby={errorMessage ? "form-error" : undefined}
          className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          aria-describedby={errorMessage ? "form-error" : undefined}
          className="mt-1.5 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            aria-describedby="password-strength"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-600 hover:text-violet-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Password strength bar */}
        {form.password.length > 0 && (
          <div className="mt-2" id="password-strength" aria-live="polite">
            <div className="flex gap-1">
              {[1, 2, 3].map((seg) => (
                <div
                  key={seg}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    strength >= seg ? strengthColour[strength] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className={`mt-1 text-xs font-medium ${strengthText[strength]}`}>
              {strengthLabel[strength]}
            </p>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm password <span aria-hidden="true" className="text-red-400">*</span>
        </label>
        <div className="relative mt-1.5">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            aria-describedby="confirm-match"
            className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
              passwordsMatch
                ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                : passwordsMismatch
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-300 focus:border-violet-500 focus:ring-violet-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-600 hover:text-violet-800"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Inline match indicator */}
        <p
          id="confirm-match"
          aria-live="polite"
          className={`mt-1 text-xs font-medium transition ${
            passwordsMatch
              ? "text-green-600"
              : passwordsMismatch
              ? "text-red-500"
              : "invisible"
          }`}
        >
          {passwordsMatch ? "Passwords match" : "Passwords do not match"}
        </p>
      </div>

      {/* Error message */}
      <div aria-live="polite" className="transition-all duration-200">
        {errorMessage && (
          <p
            id="form-error"
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}
      </div>

      {/* Required fields note */}
      <p className="text-xs text-gray-400">
        <span aria-hidden="true">* </span>All fields are required
      </p>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {status === "loading" ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
