import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    let imageUrl: string | undefined;
    let publicId: string | undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "my-app" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    const post = await db.post.create({
      data: {
        title,
        content,
        imageUrl,
        publicId,
        userId: user.id,
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("❌ Error creating post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
