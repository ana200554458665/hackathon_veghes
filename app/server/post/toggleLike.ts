"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function toggleLike(postId: string) {
  // ia header-ele brute din contextul requestului
  const rawHeaders = headers();
  const newHeaders = new Headers(await rawHeaders); // 👈 conversie necesară pentru Better Auth

  const session = await auth.api.getSession({ headers: newHeaders });
  const user = session?.user;

  if (!user) {
    throw new Error("Unauthorized");
  }

  // verificăm dacă userul a dat deja like
  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
  });

  if (existingLike) {
    await db.like.delete({
      where: { id: existingLike.id },
    });
    return { liked: false };
  }

  await db.like.create({
    data: {
      userId: user.id,
      postId,
    },
  });

  return { liked: true };
}
