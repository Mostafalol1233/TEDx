import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useWebSocketContext } from "@/hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Message, User, InsertMessage } from "@shared/schema";
import { format } from "date-fns";
import { Send, RefreshCw, User as UserIcon, MessageSquare, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch all users (for admin to start conversations)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.isAdmin === true,
  });
  
  // Fetch admin users (for regular users to contact)
  const { data: adminUsers, isLoading: adminsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/admins"],
    enabled: user?.isAdmin !== true,
  });
  
  // Fetch user messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
    select: (data) => data?.sort((a, b) => {
      // Sort by date descending
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
  });
  
  // Fetch conversation with selected user
  const { data: conversation, isLoading: conversationLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: selectedUserId !== null,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider data fresh for 5 seconds
  });
  
  const queryClient = useQueryClient();

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedUserId] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إرسال الرسالة",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedUserId] });
    },
  });
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);
  
  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation && selectedUserId && user) {
      conversation.forEach(message => {
        if (message.toUserId === user.id && !message.isRead) {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
  }, [conversation, selectedUserId, user, markAsReadMutation, queryClient]);
  
  // Group messages by user
  const messagesByUser = messages?.reduce((acc, message) => {
    if (user?.id === message.fromUserId) {
      const otherUserId = message.toUserId;
      if (!acc[otherUserId]) {
        acc[otherUserId] = [];
      }
      acc[otherUserId].push(message);
    } else if (user?.id === message.toUserId) {
      const otherUserId = message.fromUserId;
      if (!acc[otherUserId]) {
        acc[otherUserId] = [];
      }
      acc[otherUserId].push(message);
    }
    return acc;
  }, {} as Record<number, Message[]>) || {};
  
  // Get unread message counts by user
  const unreadCounts = Object.entries(messagesByUser).reduce((acc, [userId, userMessages]) => {
    acc[parseInt(userId)] = userMessages.filter(m => m.toUserId === user?.id && !m.isRead).length;
    return acc;
  }, {} as Record<number, number>);
  
  // Get the most recent message for each user
  const recentMessages = Object.entries(messagesByUser).reduce((acc, [userId, userMessages]) => {
    const sortedMessages = [...userMessages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    acc[parseInt(userId)] = sortedMessages[0];
    return acc;
  }, {} as Record<number, Message>);
  
  // Get the userName for a given userId
  const getUserName = (userId: number): string => {
    const targetUsers = user?.isAdmin ? users : adminUsers;
    const targetUser = targetUsers?.find(u => u.id === userId);
    return targetUser?.name || targetUser?.username || `مستخدم #${userId}`;
  };
  
  // Send message handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !user || !selectedUserId) return;
    
    const newMessage: InsertMessage = {
      fromUserId: user.id,
      toUserId: selectedUserId,
      content: messageText.trim()
    };
    
    sendMessageMutation.mutate(newMessage);
  };
  
  // If user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">يرجى تسجيل الدخول</h1>
        <p className="text-gray-600 mb-6">يجب عليك تسجيل الدخول للوصول إلى الرسائل</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">الرسائل</h1>
      
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Users List */}
            <div className="border-l overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold">المحادثات</h3>
              </div>
              
              {(usersLoading || adminsLoading || messagesLoading) ? (
                // Loading state
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))
              ) : (
                // Display conversations
                Object.keys(messagesByUser).length > 0 ? (
                  Object.keys(messagesByUser).map(userIdStr => {
                    const userId = parseInt(userIdStr);
                    const recentMessage = recentMessages[userId];
                    const unreadCount = unreadCounts[userId] || 0;
                    
                    return (
                      <button 
                        key={userId}
                        className={`w-full text-right flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition ${selectedUserId === userId ? 'bg-gray-100' : ''}`}
                        onClick={() => setSelectedUserId(userId)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getUserName(userId).charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{getUserName(userId)}</span>
                            {unreadCount > 0 && (
                              <Badge className="bg-primary text-white">{unreadCount}</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 truncate">
                            {recentMessage?.content}
                          </p>
                          
                          {recentMessage?.createdAt && (
                            <span className="text-xs text-gray-400">
                              {format(new Date(recentMessage.createdAt), "HH:mm - dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  // No messages
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
                    <p className="mb-4">لا توجد محادثات بعد</p>
                    {user.isAdmin ? (
                      <p>حدد مستخدمًا للبدء في المحادثة</p>
                    ) : (
                      <p>تواصل مع أحد المشرفين للمساعدة</p>
                    )}
                  </div>
                )
              )}
              
              {/* Start New Conversation Section (Admin only) */}
              {user.isAdmin && users && users.length > 0 && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium mb-2">بدء محادثة جديدة</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {users.filter(u => u.id !== user.id).map(otherUser => (
                      <Button 
                        key={otherUser.id}
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedUserId(otherUser.id)}
                        className="text-xs justify-start truncate"
                      >
                        {otherUser.name || otherUser.username}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contact Admin Section (Regular users only) */}
              {!user.isAdmin && adminUsers && adminUsers.length > 0 && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium mb-2">تواصل مع المشرفين</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {adminUsers.map(admin => (
                      <Button 
                        key={admin.id}
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedUserId(admin.id)}
                        className="text-xs justify-start truncate"
                      >
                        {admin.name || admin.username}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Conversation Area */}
            <div className="md:col-span-2 flex flex-col h-full">
              {selectedUserId ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserName(selectedUserId).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{getUserName(selectedUserId)}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedUserId] });
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {conversationLoading ? (
                      // Loading state
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className={`flex mb-4 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-2 ${i % 2 === 0 ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                            <Skeleton className={`h-16 w-48 ${i % 2 === 0 ? 'bg-primary-foreground/20' : 'bg-gray-200'}`} />
                          </div>
                        </div>
                      ))
                    ) : conversation && conversation.length > 0 ? (
                      // Display messages
                      conversation.map((message) => {
                        const isSentByMe = message.fromUserId === user.id;
                        
                        return (
                          <div key={message.id} className={`flex mb-4 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${isSentByMe ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <div className={`text-xs mt-1 ${isSentByMe ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                                {message.createdAt && format(new Date(message.createdAt), "HH:mm")}
                                {isSentByMe && message.isRead && (
                                  <span className="mr-1">✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // No messages yet
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>ابدأ المحادثة الآن</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="اكتب رسالتك هنا..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || !messageText.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // No conversation selected
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-2">اختر محادثة</h3>
                    <p>اختر محادثة من القائمة للبدء</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}