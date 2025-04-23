import { useQuery } from "@tanstack/react-query";
import { Order, Product, User } from "@shared/schema";
import { Sidebar, adminSidebarItems } from "@/components/ui/sidebar";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import StatsCard from "@/components/admin/stats-card";
import OrderTable from "@/components/admin/order-table";
import AddProductForm from "@/components/admin/add-product-form";
import UserManager from "@/components/admin/user-manager";
import { 
  Users, 
  ShoppingCart, 
  Ticket, 
  ShirtIcon 
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("/admin");
  
  // Fetch data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });
  
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const tickets = products.filter(p => p.type === "ticket");
  const tshirts = products.filter(p => p.type === "tshirt");
  
  // Stats for dashboard cards
  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: users.length,
      change: "+12%",
      isPositive: true,
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-100 text-primary",
    },
    {
      title: "إجمالي المبيعات",
      value: orders.length,
      change: "+8%",
      isPositive: true,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "التذاكر النشطة",
      value: tickets.length,
      change: "-5%",
      isPositive: false,
      icon: <Ticket className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "المنتجات المتوفرة",
      value: tshirts.length,
      change: "+15%",
      isPositive: true,
      icon: <ShirtIcon className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminSidebarItems} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatsCard 
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              isPositive={stat.isPositive}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Recent Orders and Add New Item */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="font-bold">أحدث الطلبات</h3>
              <a href="#" className="text-primary text-sm hover:underline">عرض الكل</a>
            </div>
            <OrderTable orders={orders.slice(0, 5)} />
          </Card>

          {/* Add New Item */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">إضافة منتج جديد</h3>
            <AddProductForm />
          </Card>
        </div>
        
        {/* User Management (Simplified version) */}
        <div className="mt-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">إدارة المستخدمين</h3>
            <UserManager users={users.slice(0, 5)} />
          </Card>
        </div>
      </main>
    </div>
  );
}
