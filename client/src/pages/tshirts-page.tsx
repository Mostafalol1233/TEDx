import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TshirtsPage() {
  const [category, setCategory] = useState("all");
  
  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products to get only t-shirts
  const tshirts = products?.filter(p => p.type === "tshirt") || [];
  
  // Get unique categories
  const uniqueCategories = tshirts
    .map(tshirt => tshirt.category)
    .filter((cat, index, self) => cat && self.indexOf(cat) === index);
  const categories = ["all", ...uniqueCategories];
  
  // Filter t-shirts by category if not "all"
  const filteredTshirts = tshirts.filter(tshirt => 
    category === "all" || tshirt.category === category
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">التيشيرتات الحصرية</h1>
        <p className="text-gray-600">تصفح مجموعتنا من التيشيرتات المميزة والحصرية.</p>
      </div>
      
      {/* Category Tabs */}
      {categories.length > 1 && (
        <Tabs defaultValue="all" value={category} onValueChange={setCategory} className="mb-8">
          <TabsList className="mb-4">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === "all" ? "الكل" : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* T-shirts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array(8).fill(0).map((_, i) => (
            <div key={`tshirt-skeleton-${i}`} className="bg-white rounded-xl shadow-md overflow-hidden">
              <Skeleton className="w-full h-64" />
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
        ) : filteredTshirts.length > 0 ? (
          // Render t-shirts
          filteredTshirts.map(tshirt => (
            <ProductCard key={tshirt.id} product={tshirt} />
          ))
        ) : (
          <p className="col-span-4 text-center py-12 text-gray-500">لا توجد تيشيرتات متاحة في هذه الفئة</p>
        )}
      </div>
    </div>
  );
}