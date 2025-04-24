import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Order, InsertOrder, InsertOrderItem } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarIcon, MapPinIcon, CheckCircle } from "lucide-react";
import { Redirect, Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailProps {
  id: number;
}

export default function ProductDetail({ id }: ProductDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  // Prepare sizes array if product is a t-shirt and has sizes
  const sizes = product?.type === "tshirt" && product.sizes 
    ? product.sizes.split(",") 
    : [];

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to purchase");
      if (product?.type === "tshirt" && !selectedSize) throw new Error("Please select a size");
      if ((user.points || 0) < (product?.price || 0)) throw new Error("Insufficient points");
      
      // Create an order
      const orderData: InsertOrder = {
        userId: user.id,
        totalPoints: product?.price || 0,
        status: "pending"
      };
      
      const orderRes = await apiRequest("POST", "/api/orders", orderData);
      const order: Order = await orderRes.json();
      
      // Create an order item
      const orderItemData: InsertOrderItem = {
        orderId: order.id,
        productId: product?.id || 0,
        quantity: 1,
        size: selectedSize || undefined,
        pricePerItem: product?.price || 0
      };
      
      await apiRequest("POST", "/api/order-items", orderItemData);
      
      return order;
    },
    onSuccess: () => {
      toast({
        title: "تم الشراء بنجاح",
        description: "سيتم معالجة طلبك قريباً",
      });
      
      // Invalidate orders and user data to update points
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الشراء",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-6">
                <Skeleton className="w-full h-80 mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="w-full h-20" />
                  ))}
                </div>
              </div>
              <div className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-5 w-2/3 mb-6" />
                <Skeleton className="h-32 w-full mb-6" />
                <Skeleton className="h-24 w-full mb-6" />
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">خطأ</h2>
        <p>لا يمكن تحميل تفاصيل المنتج. يرجى المحاولة مرة أخرى لاحقاً.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          العودة
        </Button>
      </div>
    );
  }

  // Define product images based on product type
  let productImages = [product.imageUrl || "https://via.placeholder.com/800x400"];
  
  if (product.type === "ticket") {
    if (product.name.includes("TEDx")) {
      productImages = [
        product.imageUrl || "https://via.placeholder.com/800x400",
        "https://i.imgur.com/CiKvA72.jpg",
        "https://i.imgur.com/u4aVQm3.jpg",
        "https://i.imgur.com/FXRzQYG.jpg"
      ];
    } else if (product.name.includes("حماقي")) {
      productImages = [
        product.imageUrl || "https://via.placeholder.com/800x400",
        "https://i.imgur.com/K3dzE98.jpg",
        "https://i.imgur.com/FXRzQYG.jpg",
        "https://i.imgur.com/u4aVQm3.jpg"
      ];
    } else {
      productImages = [
        product.imageUrl || "https://via.placeholder.com/800x400",
        "https://i.imgur.com/FXRzQYG.jpg",
        "https://i.imgur.com/CiKvA72.jpg",
        "https://i.imgur.com/u4aVQm3.jpg"
      ];
    }
  } else if (product.type === "tshirt") {
    if (product.name.includes("Red")) {
      productImages = [
        product.imageUrl || "https://via.placeholder.com/800x400",
        "https://i.imgur.com/6a6ZRXP.jpg",
        "https://i.imgur.com/8Nx43Pn.jpg",
        "https://i.imgur.com/1QYt70s.jpg"
      ];
    } else if (product.name.includes("Black")) {
      productImages = [
        product.imageUrl || "https://via.placeholder.com/800x400",
        "https://i.imgur.com/1QYt70s.jpg",
        "https://i.imgur.com/8Nx43Pn.jpg",
        "https://i.imgur.com/6a6ZRXP.jpg"
      ];
    } else {
      productImages = [
        product.imageUrl || "https://via.placeholder.com/800x400",
        "https://i.imgur.com/8Nx43Pn.jpg",
        "https://i.imgur.com/6a6ZRXP.jpg",
        "https://i.imgur.com/1QYt70s.jpg"
      ];
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Product Images */}
            <div className="p-6">
              <div className="mb-4">
                <img 
                  src={productImages[selectedImage] || "https://via.placeholder.com/800x400"} 
                  alt={product.name} 
                  className="w-full h-80 object-cover rounded-lg" 
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image || "https://via.placeholder.com/200x200"} 
                    alt={`صورة مصغرة ${index + 1}`} 
                    className={`w-full h-20 object-cover rounded-lg cursor-pointer ${selectedImage === index ? 'border-2 border-primary' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col">
              <div className="mb-2">
                <Badge variant={product.type === "ticket" ? "default" : "secondary"}>
                  {product.type === "ticket" ? product.category : "تيشيرت"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              
              {product.type === "ticket" && (
                <>
                  <div className="flex items-center mb-4 text-gray-500 text-sm">
                    <CalendarIcon className="w-4 h-4 ml-2" />
                    <span>
                      {product.eventDate 
                        ? format(new Date(product.eventDate), "dd MMMM yyyy - الساعة h:mm a") 
                        : "تاريخ الفعالية غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center mb-6 text-gray-500 text-sm">
                    <MapPinIcon className="w-4 h-4 ml-2" />
                    <span>{product.eventLocation || "المكان غير محدد"}</span>
                  </div>
                </>
              )}

              <p className="text-gray-600 mb-6">
                {product.description || "لا يوجد وصف متاح لهذا المنتج."}
              </p>

              {product.type === "ticket" && (
                <div className={`${product.name.includes("TEDx") ? "bg-red-50" : "bg-gray-50"} p-4 rounded-lg mb-6`}>
                  <h3 className="font-bold mb-2">تفاصيل التذكرة:</h3>
                  <ul className="space-y-2 text-sm">
                    {product.name.includes("TEDx") && product.name.includes("VIP") ? (
                      <>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>دخول VIP مع مقاعد مميزة في مقدمة القاعة</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>حزمة هدايا TEDx حصرية مع تيشيرت المؤتمر</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>لقاء خاص مع المتحدثين بعد المؤتمر</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>بوفيه غداء فاخر وضيافة كاملة طوال اليوم</span>
                        </li>
                      </>
                    ) : product.name.includes("TEDx") ? (
                      <>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>حضور كامل فعاليات مؤتمر TEDx للشباب</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>حقيبة TEDx تذكارية</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>ضيافة خفيفة خلال فترات الاستراحة</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 ml-2" />
                          <span>شهادة حضور مؤتمر TEDx Youth Red Sea STEM</span>
                        </li>
                      </>
                    ) : product.name.includes("ورشة") || product.name.includes("Workshop") ? (
                      <>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          <span>حضور الورشة التدريبية مع مدربين محترفين</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          <span>مواد تدريبية وأدوات للورشة</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          <span>شهادة مشاركة في الورشة</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          <span>دخول VIP مع مقاعد مميزة</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          <span>مشروبات ترحيبية مجانية</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          <span>ميت آند جريت مع الفنان بعد الحفل</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {product.type === "tshirt" && sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">اختر المقاس:</h3>
                  <Select onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر المقاس" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm">السعر</p>
                  <p className="text-2xl font-bold text-primary">{product.price} نقطة</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">العدد المتوفر</p>
                  <p className="text-lg font-bold">
                    {product.unlimited 
                      ? "غير محدود" 
                      : `${product.stock} ${product.type === "ticket" ? "تذكرة" : "قطعة"}`}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <Button 
                  className={`w-full ${product.name.includes("TEDx") ? "bg-red-600 hover:bg-red-700" : ""}`}
                  disabled={
                    purchaseMutation.isPending || 
                    (product.type === "tshirt" && !selectedSize) ||
                    (!product.unlimited && (!product.stock || product.stock <= 0)) ||
                    ((user?.points || 0) < product.price)
                  }
                  onClick={() => purchaseMutation.mutate()}
                >
                  {purchaseMutation.isPending 
                    ? "جاري الشراء..." 
                    : (user?.points || 0) < product.price
                      ? "رصيد غير كافٍ"
                      : product.type === "ticket" 
                        ? "شراء التذكرة الآن" 
                        : "إضافة للسلة"}
                </Button>
                
                {!user && (
                  <p className="text-center mt-2 text-sm text-gray-500">
                    يرجى <Link href="/auth" className="text-primary hover:underline">تسجيل الدخول</Link> لإتمام عملية الشراء
                  </p>
                )}
                
                {(user?.points || 0) < product.price && (
                  <p className="text-center mt-2 text-sm text-red-500">
                    رصيدك الحالي ({user?.points || 0} نقطة) غير كافٍ لشراء هذا المنتج
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
