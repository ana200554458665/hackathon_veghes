"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Signup failed");
      }

      console.log("✅ User created successfully!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("❌ Signup error:", err);
      alert(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 bg-card p-6 rounded-xl shadow-md"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground">Join our platform</p>
        </div>

        <div className="space-y-4">
          <Input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
