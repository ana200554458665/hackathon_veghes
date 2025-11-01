import { FeedPost } from "@/components/feedPost";

export default function FeedPage() {
  const feedPosts = [
    {
      id: "1",
      author: {
        name: "Sarah Chen",
        department: "Product Design",
        avatar: "/professional-avatar.png",
      },
      image: "/professional-avatar.png",
      likes: 24,
      liked: false,
    },
    {
      id: "2",
      author: {
        name: "Sarah Chen",
        department: "Product Design",
        avatar: "/professional-avatar.png",
      },
      image: "/professional-avatar.png",
      likes: 24,
      liked: false,
    },
    {
      id: "3",
      author: {
        name: "Sarah Chen",
        department: "Product Design",
        avatar: "/professional-avatar.png",
      },
      image: "/professional-avatar.png",
      likes: 24,
      liked: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 ">
      <div className="space-y-6">
        {feedPosts.map((post) => (
          <FeedPost key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
