"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2 } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    avatar: "/diverse-woman-portrait.png",
    content: "Hey! How are you doing?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: "2",
    sender: "You",
    avatar: "/man.jpg",
    content: "Hi Sarah! All good here. Just finished the design review.",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Sarah Johnson",
    avatar: "/diverse-woman-portrait.png",
    content:
      "Great! Can we sync up tomorrow? I have some questions about the new features.",
    timestamp: "10:35 AM",
    isOwn: false,
  },
  {
    id: "4",
    sender: "You",
    avatar: "/man.jpg",
    content: "Sure thing! How about 2 PM?",
    timestamp: "10:36 AM",
    isOwn: true,
  },
  {
    id: "5",
    sender: "Sarah Johnson",
    avatar: "/diverse-woman-portrait.png",
    content: "Perfect! See you then 👋",
    timestamp: "10:37 AM",
    isOwn: false,
  },
];

interface ChatViewProps {
  selectedChatId: string;
}

export function ChatView({ selectedChatId }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: "You",
        avatar: "/man.jpg",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  if (!selectedChatId) {
    return (
      <div className="hidden md:flex h-full items-center justify-center bg-muted/50">
        <p className="text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/diverse-woman-portrait.png" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Sarah Johnson</h3>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>{" "}
        <div className=" flex item-center justify-center  ">
          <Button variant="destructive" size="icon">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.isOwn ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={message.avatar || "/placeholder.svg"} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${
                  message.isOwn ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    message.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
