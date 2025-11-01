"use server";

import { db } from "@/lib/db";

export async function getPosts() {
  const posts = await db.post.findMany({
    include: {
      user: {
        select: {
          name: true,
          profile: {
            select: {
              departament: true,
              profileImage: true,
            },
          },
        },
      },
      likes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return posts.map((post: any) => ({
    id: post.id,
    author: {
      name: post.user.name || "Anonymous",
      department: post.user.profile?.departament || "Unknown",
      avatar: post.user.profile?.profileImage || "/placeholder.svg",
    },
    image: post.imageUrl,
    likes: post.likes.length,
    liked: false, // dacă ai user logat, verifici aici
  }));
}
