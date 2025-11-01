"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    position: "",
    department: "",
    email: "",
    password: "",
    profileImage: "",
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
          company: formData.company,
          position: formData.position,
          departament: formData.department, // matches DB field
          profileImage: formData.profileImage,
          callbackURL: "/dashboard",
        }),
      });

      // Try to parse JSON safely
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        console.error("Server did not return valid JSON");
      }

      if (res.ok) {
        console.log("✅ User created:", data);
        window.location.href = "/dashboard";
      } else {
        alert(`❌ ${data?.message || "Signup failed"}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Join the company social platform
        </p>
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
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Input
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Input
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Input
          name="email"
          type="email"
          placeholder="you@company.com"
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

        <Input
          name="profileImage"
          placeholder="https://example.com/avatar.png"
          value={formData.profileImage}
          onChange={handleChange}
          disabled={isLoading}
        />
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
  );
}
