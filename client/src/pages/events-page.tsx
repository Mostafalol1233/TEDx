import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventsPage() {
  const [category, setCategory] = useState("all");
  
  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products to get only tickets
  const tickets = products?.filter(p => p.type === "ticket") || [];
  
  // Get unique categories
  const categories = ["all", ...new Set(tickets.map(ticket => ticket.category))];
  
  // Filter tickets by category if not "all"
  const filteredTickets = tickets.filter(ticket => 
    category === "all" || ticket.category === category
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">التذاكر والفعاليات</h1>
        <p className="text-gray-600">تصفح جميع التذاكر المتاحة للفعاليات القادمة.</p>
      </div>
      
      {/* Category Tabs */}
      <Tabs defaultValue="all" value={category} onValueChange={setCategory} className="mb-8">
        <TabsList className="mb-4">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === "all" ? "الكل" : cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array(8).fill(0).map((_, i) => (
            <div key={`ticket-skeleton-${i}`} className="bg-white rounded-xl shadow-md overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : filteredTickets.length > 0 ? (
          // Render tickets
          filteredTickets.map(ticket => (
            <ProductCard key={ticket.id} product={ticket} />
          ))
        ) : (
          <p className="col-span-4 text-center py-12 text-gray-500">لا توجد تذاكر متاحة في هذه الفئة</p>
        )}
      </div>
    </div>
  );
}