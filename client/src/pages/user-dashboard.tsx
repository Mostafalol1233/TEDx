import { useQuery } from "@tanstack/react-query";
import { Order, User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import OrderItem from "@/components/order-item";
import { Loader2 } from "lucide-react";

// Profile update schema
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export default function UserDashboard() {
  const { user } = useAuth();
  
  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Profile form
  const profileForm = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Handle profile update
  function onProfileUpdate(data: ProfileUpdateFormValues) {
    console.log("Profile update:", data);
    // TODO: Implement profile update mutation
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="p-6 hero-gradient text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarImage src="https://github.com/shadcn.png" alt={user?.name || user?.username} />
                <AvatarFallback>{user?.name?.charAt(0) || user?.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user?.name || user?.username}</h2>
                <p className="opacity-90">{user?.email}</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm mb-1">رصيدك الحالي</p>
              <p className="text-2xl font-bold">{user?.points || 0} نقطة</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="orders">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                طلباتي
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                معلوماتي الشخصية
              </TabsTrigger>
              <TabsTrigger value="points" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none">
                شحن الرصيد
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Tab */}
          <TabsContent value="orders" className="p-6">
            <h3 className="text-lg font-bold mb-4">الطلبات السابقة</h3>

            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders && orders.length > 0 ? (
                orders.map(order => (
                  <OrderItem key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>لا توجد طلبات سابقة</p>
                  <Button variant="outline" className="mt-4">تصفح المنتجات</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6">
            <form onSubmit={profileForm.handleSubmit(onProfileUpdate)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input id="username" value={user?.username} disabled />
                  <p className="text-sm text-gray-500">لا يمكن تغيير اسم المستخدم</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input 
                    id="name" 
                    placeholder="أدخل اسمك الكامل"
                    {...profileForm.register("name")}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="أدخل بريدك الإلكتروني" 
                    {...profileForm.register("email")}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea 
                    id="address" 
                    placeholder="أدخل عنوانك بالتفصيل" 
                  />
                </div>
                
                <Button type="submit" className="mt-4">
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">رصيدك الحالي</h3>
                <p className="text-3xl font-bold text-primary">{user?.points || 0} نقطة</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">معلومات شحن الرصيد</h4>
                <p className="text-sm text-gray-600">
                  يرجى التواصل مع خدمة العملاء لشحن رصيدك من النقاط.
                  قريباً سيكون بإمكانك شحن رصيدك عبر الدفع الإلكتروني.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">كيفية استخدام النقاط</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>تصفح التذاكر والتيشيرتات المتاحة في المنصة</li>
                  <li>اختر المنتج الذي تريد شراءه وأضفه إلى سلة المشتريات</li>
                  <li>قم بإتمام عملية الشراء واختر الدفع بالنقاط</li>
                  <li>سيتم خصم النقاط من رصيدك تلقائياً</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
