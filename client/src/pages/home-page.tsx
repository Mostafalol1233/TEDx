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
      return data.filter(p => p.type === "ticket" && (p.stock ?? 0) > 0);
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
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="mb-4">
                <div className="inline-flex items-center bg-white px-3 py-1 rounded-lg shadow-lg">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold text-xs">TEDx</span>
                  <span className="text-xl font-bold text-gray-800 mr-2">Youth Red Sea STEM</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-md">
                احصل على تذاكر واكسسوارات حصرية
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-md">
                منصة حصرية لشراء تذاكر فعالية TEDx والمنتجات الحصرية باستخدام نظام النقاط. كن جزءاً من تجربة فريدة من نوعها في عالم الإبداع والأفكار الملهمة.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                <Link href="/events"
                  className="bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-lg text-center transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  تصفح التذاكر
                </Link>
                <Link href="/tshirts"
                  className="border-2 border-white text-white font-bold px-6 py-3 rounded-lg text-center hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  تصفح التيشيرتات
                </Link>
              </div>
              <div className="mt-8 text-sm bg-red-700/50 p-3 rounded-lg inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>الحدث: 15 أغسطس 2025 | مدرسة ريد سي ستيم، القاهرة</span>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-white p-2 rounded-xl shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300">
                <img 
                  src="https://i.imgur.com/FXRzQYG.jpg" 
                  alt="TEDx Youth Red Sea STEM" 
                  className="rounded-lg w-full object-cover h-72 md:h-auto" 
                />
                <div className="absolute -bottom-3 -left-3 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 text-sm font-bold">
                  مستعد للمشاركة؟
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Choose Us */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">لماذا TEDx Youth؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              فعاليات TEDx Youth هي فرصة للشباب للمشاركة في تجربة فريدة من نوعها، حيث يمكنهم الاستماع إلى متحدثين ملهمين ومشاركة أفكارهم الإبداعية.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">أفكار ملهمة</h3>
              <p className="text-gray-600 text-center">
                استمع إلى أفكار جديدة ومحادثات ملهمة من متحدثين متميزين في مختلف المجالات.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">تواصل وتعاون</h3>
              <p className="text-gray-600 text-center">
                فرصة للتواصل مع مجتمع من المبدعين والمفكرين وبناء علاقات مع أشخاص ذوي اهتمامات مشتركة.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">تجربة فريدة</h3>
              <p className="text-gray-600 text-center">
                احصل على تجربة لا تنسى مع ورش عمل تفاعلية وأنشطة إبداعية ومنتجات حصرية.
              </p>
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
