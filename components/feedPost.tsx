"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

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

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <img
          src={author.avatar || "/placeholder.svg"}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{author.name}</p>
          <p className="text-xs text-muted-foreground">{author.department}</p>
        </div>
      </div>

      <div className="relative w-full bg-muted aspect-square">
        <img
          src={image || "/placeholder.svg"}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Heart
            size={20}
            className={
              liked
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }
          />
          <span className={liked ? "text-red-500" : "text-foreground"}>
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
        </button>
      </div>
    </div>
  );
}
