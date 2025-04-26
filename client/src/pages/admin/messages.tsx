import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, adminSidebarItems } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocketContext } from "@/hooks/use-websocket";
import { User, Message, InsertMessage } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Send,
  Search,
  MessageSquare,
  RefreshCcw,
  User as UserIcon,
  CheckCheck
} from "lucide-react";

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addMessageHandler, sendMessage, status } = useWebSocketContext();
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest("PATCH", `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: InsertMessage) => {
      return await apiRequest("POST", "/api/messages", message);
    },
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchOnWindowFocus: false,
  });

  // Fetch messages for selected user
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    refetch: refetchMessages 
  } = useQuery<Message[]>({
    queryKey: ["/api/admin/messages", selectedUserId],
    enabled: !!selectedUserId,
    refetchOnWindowFocus: false,
  });

  // Set up WebSocket handler for real-time messages
  useEffect(() => {
    if (status === 'connected') {
      // Handle new message notifications
      const removeMessageHandler = addMessageHandler('newMessage', (messageData) => {
        if (messageData.data && 
            ((user?.id === messageData.data.fromUserId && messageData.data.toUserId === selectedUserId) || 
             (user?.id === messageData.data.toUserId && messageData.data.fromUserId === selectedUserId))) {
          // If the message is part of the current conversation, refresh messages
          queryClient.invalidateQueries({ queryKey: ["/api/admin/messages", selectedUserId] });
        } else if (messageData.data && user?.id === messageData.data.toUserId) {
          // Notification for new message from other conversations
          toast({
            title: "رسالة جديدة",
            description: `لديك رسالة جديدة من مستخدم`,
          });
          // Refresh user list to update unread counts
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        }
      });

      return () => {
        removeMessageHandler();
      };
    }
  }, [status, addMessageHandler, queryClient, user, selectedUserId, toast]);

  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedUserId && user) {
      const unreadMessages = messages.filter(m => 
        m.fromUserId === selectedUserId && m.toUserId === user.id && !m.isRead
      );
      
      if (unreadMessages.length > 0) {
        // Mark messages as read
        unreadMessages.forEach(message => {
          markAsReadMutation.mutate(message.id);
        });
      }
    }
  }, [messages, selectedUserId, user, markAsReadMutation]);

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUserId || !newMessage.trim()) return;

    const messageData: InsertMessage = {
      fromUserId: user.id,
      toUserId: selectedUserId,
      content: newMessage.trim()
    };

    sendMessageMutation.mutate(messageData);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unread message count for a user
  const getUnreadCount = (userId: number) => {
    // This is a placeholder - we'll need to implement unread count logic 
    // based on the actual structure of your user or message objects
    return 0;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={adminSidebarItems} />
      
      <div className="flex-1">
        <div className="grid h-screen grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {/* Users/Conversations Sidebar */}
          <div className="col-span-1 border-l h-full overflow-hidden flex flex-col bg-white">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold mb-4">المحادثات</h2>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث عن مستخدم..."
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
              {usersLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  لا يوجد مستخدمين مطابقين للبحث
                </div>
              ) : (
                <AnimatePresence>
                  {filteredUsers.filter(u => !u.isAdmin).map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUserId === user.id ? "bg-primary/5 border-r-4 border-primary" : ""
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 mr-3 ml-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{user.username}</h3>
                          {getUnreadCount(user.id) > 0 && (
                            <span className="px-2 py-1 bg-primary text-white rounded-full text-xs">
                              {getUnreadCount(user.id)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {user.points} نقطة
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-screen">
            {selectedUserId ? (
              <>
                {/* Message Header */}
                <div className="border-b p-4 bg-white flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold">
                        {users.find(u => u.id === selectedUserId)?.username || "المستخدم"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {users.find(u => u.id === selectedUserId)?.points || 0} نقطة
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchMessages()}
                  >
                    <RefreshCcw className="h-4 w-4 ml-2" />
                    تحديث
                  </Button>
                </div>
                
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                      <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                      <p className="mb-2">لا توجد رسائل بعد</p>
                      <p className="text-sm">ابدأ محادثة جديدة عن طريق إرسال رسالة</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isFromCurrentUser = message.fromUserId === user?.id;
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div 
                              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                isFromCurrentUser 
                                  ? "bg-primary text-white rounded-br-none" 
                                  : "bg-white text-gray-800 rounded-bl-none shadow"
                              }`}
                            >
                              <p className="mb-1">{message.content}</p>
                              <div className={`text-xs flex justify-end items-center ${isFromCurrentUser ? "text-primary-50" : "text-gray-400"}`}>
                                <span>
                                  {message.createdAt ? format(new Date(message.createdAt), "p") : ""}
                                </span>
                                {isFromCurrentUser && (
                                  <CheckCheck className={`h-3 w-3 mr-1 ${message.isRead ? "text-green-400" : "text-primary-50"}`} />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <Input
                      placeholder="اكتب رسالتك هنا..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="ml-2"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="gap-2"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      إرسال
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-50">
                <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-bold mb-2">نظام المراسلة</h3>
                <p className="max-w-md text-gray-500">
                  اختر أحد المستخدمين من القائمة لبدء المحادثة أو عرض المحادثات السابقة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}