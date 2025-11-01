"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ImagePlus } from "lucide-react";

export function CreatePostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("file", image);

      const res = await fetch("/api/posts/add", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      setTitle("");
      setContent("");
      setImage(null);
      setPreview(null);
      router.refresh(); // ♻️ Refresh feed
    } catch (err) {
      console.error("❌ Error creating post:", err);
      alert("Something went wrong while creating the post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-border rounded-xl shadow-sm bg-card space-y-3 mb-6"
    >
      <h3 className="font-semibold text-lg text-foreground">Create a Post</h3>

      <Input
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Input
        placeholder="Add some text (optional)..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ImagePlus className="w-4 h-4" />
          <span>Choose image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="h-12 w-12 object-cover rounded-md border"
          />
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
          </>
        ) : (
          "Post"
        )}
      </Button>
    </form>
  );
}
