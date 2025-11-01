import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import FeedPage from "@/components/feedPage";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <FeedPage />
    </div>
  );
}
