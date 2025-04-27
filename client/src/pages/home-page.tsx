import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryFilter from "@/components/category-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useWebSocketContext } from "@/hooks/use-websocket";
import { motion } from "framer-motion";
import { Ticket, ShoppingBag, Users, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import LocalImage from "@/components/local-image";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { addMessageHandler, sendMessage, status } = useWebSocketContext();
  const queryClient = useQueryClient();
  
  // Fetch products with optimized settings
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 60000, // 1 minute
    select: (data) => {
      if (!data) return [];
      // Pre-process the data to avoid doing it in the render
      return data;
    },
  });

  // Set up WebSocket handlers for real-time updates
  useEffect(() => {
    // Request products when WebSocket is connected
    if (status === 'connected') {
      sendMessage({ type: 'getProducts' });
      
      // Log connection status
      console.log('WebSocket connected, requesting products data');
    }
    
    // Handle product updates from WebSocket
    const removeProductHandler = addMessageHandler('products', (message) => {
      console.log('Received products update via WebSocket', message);
      if (message.data) {
        // Update the products in the cache
        queryClient.setQueryData(['/api/products'], message.data);
      }
    });
    
    // Handle single product creation notifications
    const removeProductCreatedHandler = addMessageHandler('productCreated', (message) => {
      console.log('New product created:', message.data);
      // Invalidate the products query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    });
    
    // Clean up handlers when component unmounts
    return () => {
      removeProductHandler();
      removeProductCreatedHandler();
    };
  }, [status, sendMessage, addMessageHandler, queryClient]);

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
                <LocalImage 
                  src="/images/download.png" 
                  fallbackSrc="https://i.imgur.com/6QJjYQ6.jpg"
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
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              className="bg-white p-6 rounded-xl shadow-md transition-all"
            >
              <motion.div 
                className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  backgroundColor: "rgb(254, 226, 226)" // red-100 with a bit more saturation
                }}
              >
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                >
                  <Ticket className="h-8 w-8" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-center mb-2">أفكار ملهمة</h3>
              <p className="text-gray-600 text-center">
                استمع إلى أفكار جديدة ومحادثات ملهمة من متحدثين متميزين في مختلف المجالات.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              className="bg-white p-6 rounded-xl shadow-md transition-all"
            >
              <motion.div 
                className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto"
                whileHover={{ 
                  scale: 1.1,
                  rotate: -5,
                  backgroundColor: "rgb(254, 226, 226)" // red-100 with a bit more saturation
                }}
              >
                <motion.div 
                  animate={{ 
                    y: [0, -5, 0],
                    transition: { 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "loop"
                    }
                  }}
                >
                  <Users className="h-8 w-8" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-center mb-2">تواصل وتعاون</h3>
              <p className="text-gray-600 text-center">
                فرصة للتواصل مع مجتمع من المبدعين والمفكرين وبناء علاقات مع أشخاص ذوي اهتمامات مشتركة.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              className="bg-white p-6 rounded-xl shadow-md transition-all"
            >
              <motion.div 
                className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  backgroundColor: "rgb(254, 226, 226)" // red-100 with a bit more saturation
                }}
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    transition: { 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "loop"
                    }
                  }}
                >
                  <ShoppingBag className="h-8 w-8" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-bold text-center mb-2">تجربة فريدة</h3>
              <p className="text-gray-600 text-center">
                احصل على تجربة لا تنسى مع ورش عمل تفاعلية وأنشطة إبداعية ومنتجات حصرية.
              </p>
            </motion.div>
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
