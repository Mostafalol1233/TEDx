import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryFilter from "@/components/category-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "wouter";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Fetch products with optimized settings
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 60000, // 1 minute
    select: (data) => {
      if (!data) return [];
      // Pre-process the data to avoid doing it in the render
      return data.filter(p => p.type === "ticket" && p.stock > 0);
    },
  });

  // Filter products by type and category
  const tickets = products?.filter(p => p.type === "ticket") || [];
  const tshirts = products?.filter(p => p.type === "tshirt") || [];
  
  // Filter by category if not "all"
  const filteredProducts = products?.filter(p => 
    activeCategory === "all" || p.category === activeCategory
  ) || [];

  return (
    <div>
      {/* Hero Section */}
      <div className="tedx-gradient text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="mb-2">
                <span className="bg-white text-red-600 px-2 py-1 rounded font-bold">TEDx</span>
                <span className="text-xl font-bold ml-2">Youth Red Sea STEM</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                احصل على تذاكر الفعاليات وتيشيرتات حصرية
              </h2>
              <p className="text-lg mb-8 text-gray-100">
                منصة رسمية لشراء تذاكر فعالية TEDx Youth Red Sea STEM والمنتجات الحصرية باستخدام نظام النقاط
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                <Link href="/events"
                  className="bg-white text-red-600 font-bold px-6 py-3 rounded-lg text-center hover:bg-gray-100 transition">
                  تصفح التذاكر
                </Link>
                <Link href="/tshirts"
                  className="border border-white text-white font-bold px-6 py-3 rounded-lg text-center hover:bg-white/10 transition">
                  تصفح التيشيرتات
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-200">
                <p>الحدث: 15-16 ديسمبر 2023 | مدرسة ريد سي ستيم، القاهرة</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-white p-1 rounded-lg shadow-lg">
                <img 
                  src="https://i.imgur.com/FXRzQYG.jpg" 
                  alt="TEDx Youth Red Sea STEM" 
                  className="rounded-lg w-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="container mx-auto px-4 py-8">
        <CategoryFilter 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />
      </div>

      {/* Featured Events Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">أحدث الفعاليات</h2>
          <Link href="/events" className="text-primary hover:underline font-medium">
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, i) => (
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
          ) : tickets.length > 0 ? (
            // Render tickets
            tickets.slice(0, 4).map(ticket => (
              <ProductCard key={ticket.id} product={ticket} />
            ))
          ) : (
            <p className="col-span-4 text-center py-8 text-gray-500">لا توجد تذاكر متاحة حالياً</p>
          )}
        </div>
      </section>

      {/* T-shirts Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">تيشيرتات مميزة</h2>
          <Link href="/tshirts" className="text-primary hover:underline font-medium">
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, i) => (
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
          ) : tshirts.length > 0 ? (
            // Render tshirts
            tshirts.slice(0, 4).map(tshirt => (
              <ProductCard key={tshirt.id} product={tshirt} />
            ))
          ) : (
            <p className="col-span-4 text-center py-8 text-gray-500">لا توجد تيشيرتات متاحة حالياً</p>
          )}
        </div>
      </section>
    </div>
  );
}
