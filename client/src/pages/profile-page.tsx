import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useWebSocketContext } from "@/hooks/use-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Order, Message } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ShoppingBag, MessageCircle, CreditCard, Star, Linkedin, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const { status: wsStatus } = useWebSocketContext();
  const [selectedTab, setSelectedTab] = useState("profile");
  
  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });
  
  // Fetch user messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });
  
  // Get unread message count
  const unreadMessageCount = messages?.filter(m => m.toUserId === user?.id && !m.isRead).length || 0;
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">يرجى تسجيل الدخول</h1>
        <p className="text-gray-600 mb-6">يجب عليك تسجيل الدخول للوصول إلى الملف الشخصي</p>
        <Button asChild>
          <Link href="/auth">تسجيل الدخول</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarFallback className="text-3xl">{user.name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.isAdmin && (
              <Badge className="absolute -bottom-2 -right-2 bg-red-600">مشرف</Badge>
            )}
          </div>
          
          <div className="text-center md:text-right md:flex-1">
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            <p className="text-gray-500">{user.email || "لا يوجد بريد إلكتروني"}</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">النقاط</p>
                  <p className="font-bold">{user.points?.toLocaleString() || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المستوى</p>
                  <p className="font-bold">{Math.floor((user.points || 0) / 1000) + 1}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الطلبات</p>
                  <p className="font-bold">{orders?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الرسائل</p>
                  <p className="font-bold">{messages?.length || 0} {unreadMessageCount > 0 && <Badge variant="destructive" className="ml-2">{unreadMessageCount}</Badge>}</p>
                </div>
              </div>
            </div>
            
            <div className="flex mt-6 gap-3 justify-center md:justify-start">
              <Button asChild>
                <Link href="/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  طلباتي
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/messages">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  الرسائل
                </Link>
              </Button>
              
              <Button variant="ghost" asChild>
                <a href="https://www.linkedin.com/in/mostafa-mohamed-409540336/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Tabs defaultValue="profile" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="messages">الرسائل</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المستخدم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">اسم المستخدم</p>
                    <p>{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">الاسم</p>
                    <p>{user.name || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">البريد الإلكتروني</p>
                    <p>{user.email || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">النقاط</p>
                    <p>{user.points?.toLocaleString() || 0}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">روابط خارجية</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://www.linkedin.com/in/mostafa-mohamed-409540336/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>طلباتي</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-md"></div>
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">طلب #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy") : "تاريخ غير محدد"}
                          </p>
                        </div>
                        <Badge
                          className={
                            order.status === "completed" ? "bg-green-500" : 
                            order.status === "processing" ? "bg-blue-500" : 
                            order.status === "cancelled" ? "bg-red-500" : 
                            "bg-gray-500"
                          }
                        >
                          {order.status === "completed" ? "مكتمل" : 
                           order.status === "processing" ? "قيد المعالجة" : 
                           order.status === "cancelled" ? "ملغي" : 
                           order.status}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-right font-bold">{order.totalPoints.toLocaleString()} نقطة</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>ليس لديك أي طلبات بعد</p>
                  <Button asChild className="mt-3">
                    <Link href="/">تصفح المنتجات</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>الرسائل</CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.slice(0, 5).map(message => (
                    <div 
                      key={message.id} 
                      className={`border p-4 rounded-lg ${message.toUserId === user.id && !message.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {message.fromUserId === user.id ? "أنت" : "المشرف"}
                            <span className="text-gray-400 mx-2">→</span>
                            {message.toUserId === user.id ? "أنت" : "المشرف"}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {message.createdAt ? format(new Date(message.createdAt), "HH:mm - dd/MM/yyyy") : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center">
                    <Button asChild>
                      <Link href="/messages">عرض كل الرسائل</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>ليس لديك أي رسائل بعد</p>
                  <Button asChild className="mt-3">
                    <Link href="/messages">إرسال رسالة</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Connection Status */}
      <div className="mt-8 flex justify-end">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${wsStatus === 'connected' ? 'bg-green-500' : wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {wsStatus === 'connected' ? 'متصل بالخادم' : wsStatus === 'connecting' ? 'جاري الاتصال...' : 'غير متصل'}
          </span>
        </div>
      </div>
    </div>
  );
}