"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/app/server/post/toggleLike"; // 👈 import server action

interface FeedPostProps {
  id: string;
  author: {
    name: string;
    department: string;
    avatar: string;
  };
  image: string;
  likes: number;
  liked?: boolean;
}

export function FeedPost({
  id,
  author,
  image,
  likes: initialLikes,
  liked: initialLiked = false,
}: FeedPostProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    startTransition(async () => {
      try {
        const res = await toggleLike(id);
        setLiked(res.liked);
        setLikeCount((prev) => (res.liked ? prev + 1 : prev - 1));
      } catch (err) {
        console.error("Error toggling like:", err);
      }
    });
  };

  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      {/* Header */}
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{author.name}</p>
          <p className="text-xs text-muted-foreground">{author.department}</p>
        </div>
      </CardHeader>

      {/* Imaginea postării */}
      <div className="relative w-full bg-muted aspect-square">
        <img
          src={image || "/placeholder.svg"}
          alt="Post"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </div>

      {/* Like bar */}
      <CardContent className="p-4 flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 transition active:scale-95",
            liked ? "text-red-500" : "text-muted-foreground"
          )}
        >
          <Heart
            className={cn(
              "w-6 h-6 transition-all",
              liked ? "fill-red-500" : "fill-transparent"
            )}
          />
          <span className="text-sm">{likeCount}</span>
        </button>
      </CardContent>
    </Card>
  );
}
