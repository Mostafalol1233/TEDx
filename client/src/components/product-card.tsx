import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarIcon, MapPinIcon, ShoppingCart, Ticket, ShirtIcon, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isTicket = product.type === "ticket";
  const sizes = !isTicket && product.sizes ? product.sizes.split(",") : [];
  const isTEDx = product.name.includes("TEDx");
  
  // Variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.2 }
    }
  };
  
  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.7 }
    }
  };
  
  const tedxLogoVariants = {
    hidden: { opacity: 0, scale: 0.7 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.3,
        duration: 0.5,
        type: "spring", 
        stiffness: 200 
      }
    }
  };
  
  const badgeVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: 0.2,
        duration: 0.3
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <Card className="overflow-hidden group h-full flex flex-col shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative overflow-hidden">
          <motion.img 
            src={product.imageUrl || "https://via.placeholder.com/800x400"} 
            alt={product.name} 
            className={`w-full ${isTicket ? 'h-52' : 'h-64'} object-cover`}
            variants={imageVariants}
            onError={(e) => {
              // Fallback for image loading errors
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
          
          {/* TEDx Logo for t-shirts */}
          {isTEDx && !isTicket && (
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              variants={tedxLogoVariants}
            >
              <div className="bg-white/90 rounded-full p-3 shadow-lg">
                <div className="bg-red-600 text-white font-bold text-xl px-3 py-1 rounded-lg">
                  TEDx
                </div>
              </div>
            </motion.div>
          )}
          
          {isTEDx && (
            <motion.div 
              className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg flex items-center"
              variants={badgeVariants}
            >
              <span className="mr-1">TEDx</span>
              <Star className="w-3 h-3" />
            </motion.div>
          )}
          
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.div variants={badgeVariants}>
              <Badge variant={isTicket ? "default" : "secondary"} className="shadow-lg px-3 py-1 text-xs rounded-full">
                {isTicket ? (
                  <div className="flex items-center">
                    <Ticket className="w-3 h-3 ml-1" />
                    <span>{product.category}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ShirtIcon className="w-3 h-3 ml-1" />
                    <span>تيشيرت</span>
                  </div>
                )}
              </Badge>
            </motion.div>
            
            {product.stock && product.stock < 10 && !product.unlimited && (
              <motion.div
                variants={badgeVariants}
                animate={{ 
                  scale: [1, 1.05, 1],
                  transition: { 
                    repeat: Infinity, 
                    duration: 2 
                  }
                }}
              >
                <Badge variant="destructive" className="shadow-lg px-3 py-1 text-xs rounded-full">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 ml-1" />
                    <span>كمية محدودة</span>
                  </div>
                </Badge>
              </motion.div>
            )}
          </div>
        </div>
        
        <CardContent className="p-5 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1 hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description || "لا يوجد وصف متاح لهذا المنتج"}
          </p>
          
          {isTicket ? (
            <div className="flex flex-col gap-2 text-gray-500 mb-3 text-sm">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 ml-2 text-gray-400" />
                <span>{product.eventDate 
                  ? format(new Date(product.eventDate), "dd/MM/yyyy") 
                  : "تاريخ غير محدد"}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 ml-2 text-gray-400" />
                <span className="truncate">{product.eventLocation || "مكان غير محدد"}</span>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">المقاسات المتاحة:</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <motion.span 
                    key={size} 
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-default"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    {size.trim()}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-auto pt-3 border-t">
            <div className="flex flex-col">
              <motion.span 
                className={`${isTEDx ? 'text-red-600' : 'text-primary'} font-bold text-xl`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {product.price.toLocaleString()} نقطة
              </motion.span>
              <span className="text-gray-500 text-xs">
                {product.unlimited 
                  ? "متوفر دائماً" 
                  : (product.stock 
                      ? `${product.stock} متبقي` 
                      : "نفذت الكمية")}
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                variant={isTEDx ? "destructive" : "default"}
                className={`rounded-full px-4 ${product.stock === 0 && !product.unlimited ? 'opacity-50 cursor-not-allowed' : ''}`}
                asChild={product.stock !== 0 || product.unlimited ? true : undefined}
                disabled={product.stock === 0 && !product.unlimited}
              >
                {product.stock !== 0 || product.unlimited ? (
                  <Link href={`/product/${product.id}`} className="flex items-center gap-1">
                    {isTicket ? <Ticket className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>{isTicket ? "شراء التذكرة" : "طلب الآن"}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">نفذت الكمية</span>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
