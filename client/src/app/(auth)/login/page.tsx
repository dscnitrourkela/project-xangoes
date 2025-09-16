
"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import { z } from "zod";


const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");


  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [message, setMessage] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
   
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setMessage(""); 
      return;
    }

    setErrors({});

    //demo credentials check  
    if (email === "test@example.com" && password === "123456") {
      setMessage("Login successful!");
    } else {
      setMessage("Invalid credentials. Try again.");
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: undefined })); 
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: undefined })); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-md">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
          Login
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Enter your credentials to access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className="text-gray-600 mt-2 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none text-gray-900"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              className="text-gray-600 mt-2 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Sign In
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.includes("Login successful!") ? "text-green-600" : "text-red-500"
            }`}
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don’t have an account?{" "}
            <a href="/sign-up" className="text-gray-900 hover:underline">
              Sign Up
            </a>
          </p>
          <p className="mt-2">
            Forgot password?{" "}
            <a href="/forgot-password" className="text-gray-900 hover:underline">
              Reset
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
