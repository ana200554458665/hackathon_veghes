import { Navbar } from "@/components/navbar";
import { FeedPost } from "./feedPost";
import { CreatePostForm } from "./create-post";
import { getPosts } from "@/app/server/post/getPost";

export default async function FeedPage() {
  const feedPosts = await getPosts();

  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <CreatePostForm />
        <div className="space-y-6">
          {feedPosts.map((post: any) => (
            <FeedPost key={post.id} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
}
