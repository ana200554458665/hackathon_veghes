"use client";

import { ChatList } from "@/components/chat-list";
import { ChatView } from "@/components/chat-view";
import { useState } from "react";

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState("2");

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0">
      {/* Chat List - 20% on desktop, hidden on mobile */}
      <div className="hidden md:flex md:w-1/5 border-r border-border">
        <ChatList
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>

      {/* Chat View - 80% on desktop, full on mobile */}
      <div className="flex-1 md:w-4/5">
        <ChatView selectedChatId={selectedChatId} />
      </div>
    </div>
  );
}
