import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryFilter from "@/components/category-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "wouter";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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
      <div className="hero-gradient text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                احصل على تذاكر الفعاليات وتيشيرتات حصرية
              </h2>
              <p className="text-lg mb-8 text-blue-100">
                منصة رقمية تتيح لك شراء تذاكر الفعاليات وتيشيرتات خاصة بكل سهولة باستخدام نظام النقاط
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                <Link href="/#tickets">
                  <a className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg text-center hover:bg-blue-50 transition">
                    تصفح التذاكر
                  </a>
                </Link>
                <Link href="#tshirts">
                  <a className="border border-white text-white font-bold px-6 py-3 rounded-lg text-center hover:bg-white/10 transition">
                    تصفح التيشيرتات
                  </a>
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1582056615228-5bd33afb452f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="تذاكر فعاليات" 
                className="rounded-lg shadow-lg w-full" 
              />
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
      <section id="tickets" className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">أحدث الفعاليات</h2>
          <Link href="/events">
            <a className="text-primary hover:underline font-medium">عرض الكل</a>
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
      <section id="tshirts" className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">تيشيرتات مميزة</h2>
          <Link href="/tshirts">
            <a className="text-primary hover:underline font-medium">عرض الكل</a>
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
