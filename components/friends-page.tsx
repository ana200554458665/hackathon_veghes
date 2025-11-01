"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserMinus, Check, X, Users } from "lucide-react";

// Mock data
const mockFriends = [
  {
    id: 1,
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
  },
  {
    id: 2,
    name: "Michael Chen",
    username: "@mchen",
    avatar: "/man.jpg",
    status: "offline",
  },
  {
    id: 3,
    name: "Emma Davis",
    username: "@emmad",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
  },
  {
    id: 4,
    name: "James Wilson",
    username: "@jwilson",
    avatar: "/man.jpg",
    status: "online",
  },
  {
    id: 5,
    name: "Olivia Brown",
    username: "@oliviab",
    avatar: "/diverse-woman-portrait.png",
    status: "offline",
  },
];

const mockPending = [
  {
    id: 6,
    name: "Alex Martinez",
    username: "@alexm",
    avatar: "/diverse-group.png",
    timestamp: "2 hours ago",
  },
  {
    id: 7,
    name: "Sophie Taylor",
    username: "@sophiet",
    avatar: "/diverse-woman-portrait.png",
    timestamp: "5 hours ago",
  },
  {
    id: 8,
    name: "Daniel Lee",
    username: "@danlee",
    avatar: "/man.jpg",
    timestamp: "1 day ago",
  },
];

const mockRequests = [
  {
    id: 9,
    name: "Rachel Green",
    username: "@rachelg",
    avatar: "/diverse-woman-portrait.png",
    timestamp: "3 days ago",
  },
  {
    id: 10,
    name: "Tom Anderson",
    username: "@toma",
    avatar: "/man.jpg",
    timestamp: "1 week ago",
  },
];

export function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  const filteredFriends = mockFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              Friends
            </h1>
          </div>
          <p className="text-muted-foreground text-pretty">
            Manage your connections and friend requests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="friends" className="gap-2">
              Friends
              <Badge variant="secondary" className="ml-1">
                {mockFriends.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              <Badge variant="secondary" className="ml-1">
                {mockPending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              Your Requests
              <Badge variant="secondary" className="ml-1">
                {mockRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends" className="space-y-3">
            {filteredFriends.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No friends found</p>
              </Card>
            ) : (
              filteredFriends.map((friend) => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={friend.avatar || "/placeholder.svg"}
                            alt={friend.name}
                          />
                          <AvatarFallback>
                            {friend.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {friend.status === "online" && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium leading-none mb-1">
                          {friend.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {friend.username}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Pending Requests */}
          <TabsContent value="pending" className="space-y-3">
            {mockPending.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              mockPending.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={request.avatar || "/placeholder.svg"}
                          alt={request.name}
                        />
                        <AvatarFallback>
                          {request.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium leading-none mb-1">
                          {request.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.username}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Your Requests */}
          <TabsContent value="requests" className="space-y-3">
            {mockRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No outgoing requests</p>
              </Card>
            ) : (
              mockRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={request.avatar || "/placeholder.svg"}
                          alt={request.name}
                        />
                        <AvatarFallback>
                          {request.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium leading-none mb-1">
                          {request.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.username}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent {request.timestamp}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
