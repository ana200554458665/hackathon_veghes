"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
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
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Logged in:", data);
        window.location.href = "/dashboard";
      } else {
        alert(`❌ ${data?.message || "Invalid email or password"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">Log in to your account</p>
      </div>

      <div className="space-y-4">
        <Input
          name="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLoading ? "Logging in..." : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary hover:underline font-medium"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
