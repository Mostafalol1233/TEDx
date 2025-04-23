import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InsertPointTransfer, PointTransfer, User } from "@shared/schema";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeftIcon, RefreshCw, BadgeCheck, Coins } from "lucide-react";
import { format } from "date-fns";

// Form schema for point transfer
const pointTransferSchema = z.object({
  toUserId: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "يرجى اختيار مستخدم"
  }),
  points: z.string().refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "يجب أن يكون عدد النقاط أكبر من صفر"
  }),
  reason: z.string().optional(),
});

type PointTransferFormValues = z.infer<typeof pointTransferSchema>;

export default function PointTransferPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transfer");
  
  // Form setup
  const form = useForm<PointTransferFormValues>({
    resolver: zodResolver(pointTransferSchema),
    defaultValues: {
      toUserId: "",
      points: "",
      reason: "",
    },
  });

  // Fetch all users (for admin to send points)
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.isAdmin === true,
  });
  
  // Fetch user point transfers
  const { data: pointTransfers, isLoading: transfersLoading } = useQuery<PointTransfer[]>({
    queryKey: ["/api/point-transfers"],
  });
  
  // Send points mutation
  const sendPointsMutation = useMutation({
    mutationFn: async (data: InsertPointTransfer) => {
      const res = await apiRequest("POST", "/api/point-transfers", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال النقاط بنجاح",
        description: "تم تحويل النقاط إلى المستخدم المحدد",
        variant: "default",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/point-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إرسال النقاط",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get the userName for a given userId
  const getUserName = (userId: number): string => {
    const targetUser = users?.find(u => u.id === userId);
    return targetUser?.name || targetUser?.username || `مستخدم #${userId}`;
  };
  
  // Handle form submission
  const onSubmit = (values: PointTransferFormValues) => {
    if (!user) return;
    
    const formData: InsertPointTransfer = {
      fromUserId: user.id,
      toUserId: parseInt(values.toUserId),
      points: parseInt(values.points),
      reason: values.reason || undefined,
    };
    
    // Validate that user has enough points if not admin
    if (!user.isAdmin && (user.points || 0) < formData.points) {
      toast({
        title: "نقاط غير كافية",
        description: "ليس لديك نقاط كافية لإجراء هذا التحويل",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent sending points to self
    if (formData.fromUserId === formData.toUserId) {
      toast({
        title: "غير مسموح",
        description: "لا يمكنك إرسال نقاط لنفسك",
        variant: "destructive",
      });
      return;
    }
    
    sendPointsMutation.mutate(formData);
  };
  
  // If user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">يرجى تسجيل الدخول</h1>
        <p className="text-gray-600 mb-6">يجب عليك تسجيل الدخول للوصول إلى صفحة تحويل النقاط</p>
      </div>
    );
  }
  
  // If not admin and it's a regular user, only show history
  if (!user.isAdmin && !activeTab.includes("history")) {
    setActiveTab("history");
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">إدارة النقاط</h1>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg">
          <Coins className="h-6 w-6 text-primary" />
          <div>
            <span className="font-bold text-primary text-xl">{user.points}</span>
            <span className="mr-1">نقطة</span>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {user.isAdmin && (
            <TabsTrigger value="transfer">تحويل النقاط</TabsTrigger>
          )}
          <TabsTrigger value="history">سجل التحويلات</TabsTrigger>
        </TabsList>
        
        {user.isAdmin && (
          <TabsContent value="transfer">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>تحويل النقاط للمستخدمين</CardTitle>
                <CardDescription>
                  يمكنك إرسال النقاط للمستخدمين. بصفتك مشرفاً، لن يتم خصم النقاط من رصيدك.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="toUserId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستخدم المستلم</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المستخدم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {usersLoading ? (
                                <SelectItem value="loading" disabled>جاري تحميل المستخدمين...</SelectItem>
                              ) : users && users.length > 0 ? (
                                users.filter(u => u.id !== user.id).map(otherUser => (
                                  <SelectItem 
                                    key={otherUser.id}
                                    value={otherUser.id.toString()}
                                  >
                                    {otherUser.name || otherUser.username}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>لا يوجد مستخدمين</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عدد النقاط</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="أدخل عدد النقاط"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سبب التحويل (اختياري)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="أدخل سبب التحويل..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            سيتم عرض سبب التحويل للمستخدم المستلم
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={sendPointsMutation.isPending}
                    >
                      {sendPointsMutation.isPending ? "جاري التحويل..." : "تحويل النقاط"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="history">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>سجل تحويلات النقاط</CardTitle>
              <CardDescription>
                عرض جميع عمليات تحويل النقاط الخاصة بك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transfersLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                  <p>جاري تحميل سجل التحويلات...</p>
                </div>
              ) : pointTransfers && pointTransfers.length > 0 ? (
                <div className="space-y-6">
                  {pointTransfers
                    .filter(transfer => transfer.fromUserId === user.id || transfer.toUserId === user.id)
                    .sort((a, b) => {
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    })
                    .map(transfer => {
                      const isReceived = transfer.toUserId === user.id;
                      
                      return (
                        <div key={transfer.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-full mr-3 ${isReceived ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isReceived ? (
                                  <ChevronLeftIcon className="h-5 w-5" />
                                ) : (
                                  <ChevronLeftIcon className="h-5 w-5 transform rotate-180" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {isReceived ? (
                                    <>استلام نقاط من {getUserName(transfer.fromUserId)}</>
                                  ) : (
                                    <>إرسال نقاط إلى {getUserName(transfer.toUserId)}</>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {transfer.createdAt && format(new Date(transfer.createdAt), "dd/MM/yyyy - HH:mm")}
                                </p>
                              </div>
                            </div>
                            <div className={`font-bold text-lg ${isReceived ? 'text-green-600' : 'text-primary'}`}>
                              {isReceived ? '+' : '-'}{transfer.points} نقطة
                            </div>
                          </div>
                          
                          {transfer.reason && (
                            <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                              <p className="text-xs text-gray-500 mb-1">السبب:</p>
                              {transfer.reason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">لا توجد تحويلات سابقة</p>
                  {user.isAdmin && (
                    <p>ابدأ بتحويل النقاط للمستخدمين من تبويب تحويل النقاط</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}