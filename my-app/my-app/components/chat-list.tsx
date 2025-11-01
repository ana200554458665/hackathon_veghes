"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useState } from "react";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const chats: Chat[] = [
  {
    id: "1",
    name: "Design Team",
    avatar: "/diverse-professional-team.png",
    initials: "DT",
    lastMessage: "Looks great! Ready for launch 🚀",
    timestamp: "2m",
    unread: 0,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar: "/diverse-woman-portrait.png",
    initials: "SJ",
    lastMessage: "Can we sync up tomorrow?",
    timestamp: "5m",
    unread: 2,
  },
  {
    id: "3",
    name: "Product Team",
    avatar: "/diverse-professional-team.png",
    initials: "PT",
    lastMessage: "New feature rollout scheduled",
    timestamp: "1h",
    unread: 0,
  },
  {
    id: "4",
    name: "Alex Martinez",
    avatar: "/man.jpg",
    initials: "AM",
    lastMessage: "Thanks for the update!",
    timestamp: "3h",
    unread: 0,
  },
  {
    id: "5",
    name: "Marketing Squad",
    avatar: "/diverse-professional-team.png",
    initials: "MS",
    lastMessage: "Campaign metrics looking good",
    timestamp: "1d",
    unread: 1,
  },
];

export function ChatList({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                selectedChatId === chat.id
                  ? "bg-primary/10 hover:bg-primary/15"
                  : "hover:bg-muted"
              }`}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage
                  src={chat.avatar || "/placeholder.svg"}
                  alt={chat.name}
                />
                <AvatarFallback>{chat.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm truncate">{chat.name}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {chat.timestamp}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
